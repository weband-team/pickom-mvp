# Stripe Webhooks Setup Guide

## Overview

Webhooks позволяют Stripe уведомлять наш сервер о событиях платежей в реальном времени. Это критически важно для обновления статусов платежей и балансов пользователей.

## Обрабатываемые события

Наш сервер обрабатывает следующие webhook события:

- ✅ `checkout.session.completed` - Checkout сессия завершена
- ✅ `payment_intent.succeeded` - Платеж успешно завершен
- ✅ `payment_intent.payment_failed` - Платеж не прошел
- ✅ `payment_intent.canceled` - Платеж отменен

## Локальная разработка

### 1. Установка Stripe CLI

**Windows (через Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Другие методы:**
- Скачать напрямую: https://github.com/stripe/stripe-cli/releases
- Через Chocolatey: `choco install stripe-cli`

### 2. Авторизация

```bash
stripe login
```

Откроется браузер для авторизации в вашем Stripe аккаунте.

### 3. Запуск webhook forwarding

В отдельном терминале:

```bash
stripe listen --forward-to localhost:4242/payment/webhook
```

Вы получите webhook signing secret вида `whsec_...`

### 4. Настройка .env

Добавьте в `pickom-server/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
```

### 5. Запуск сервера

```bash
cd pickom-server
npm run start:dev
```

### 6. Тестирование

**Через тестовую страницу:**
```
http://localhost:4242/test-stripe-checkout.html
```

**Тестовая карта:**
- Номер: `4242 4242 4242 4242`
- Дата: любая будущая (12/25)
- CVC: любые 3 цифры (123)
- ZIP: любой (12345)

**Через CLI:**
```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
```

## Production Setup

### 1. Создание webhook endpoint в Stripe Dashboard

1. Перейдите на https://dashboard.stripe.com/webhooks
2. Нажмите "Add endpoint"
3. Введите данные:
   ```
   Endpoint URL: https://your-domain.com/payment/webhook
   Description: Pickom Payment Webhooks
   ```

### 2. Выбор событий

Выберите следующие события:
- ✅ checkout.session.completed
- ✅ payment_intent.succeeded
- ✅ payment_intent.payment_failed
- ✅ payment_intent.canceled

### 3. Получение webhook secret

После создания endpoint:
1. Нажмите на созданный endpoint
2. В разделе "Signing secret" нажмите "Reveal"
3. Скопируйте секрет (начинается с `whsec_...`)

### 4. Настройка production .env

Добавьте в production `.env`:

```bash
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

⚠️ **ВАЖНО:**
- Используйте live ключи для production
- Храните секреты в безопасном месте (переменные окружения, secrets manager)
- НЕ коммитьте .env файлы в git

### 5. Настройка HTTPS

Stripe требует HTTPS для production webhooks. Убедитесь, что ваш сервер:
- Использует SSL/TLS сертификат
- Доступен по HTTPS
- Имеет публичный IP или домен

### 6. Проверка endpoint

После настройки можно протестировать через Stripe Dashboard:
1. Откройте ваш webhook endpoint
2. Нажмите "Send test webhook"
3. Выберите событие и отправьте

## Архитектура обработки webhook

### Raw Body Requirement

Stripe требует raw body (Buffer) для верификации подписи. В NestJS это настроено в `main.ts`:

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true, // Enable raw body globally
});
```

### Обработка событий

**PaymentController** (`src/payment/payment.controller.ts`):
```typescript
@Post('webhook')
@HttpCode(200)
async handleWebhook(
  @Headers('stripe-signature') signature: string,
  @Req() req: RawBodyRequest<Request>,
) {
  return this.paymentService.handleWebhook(signature, req.rawBody);
}
```

**PaymentService** (`src/payment/payment.service.ts`):
1. Верификация подписи через Stripe SDK
2. Обработка события в зависимости от типа
3. Обновление статуса платежа в БД
4. Обновление балансов пользователей (атомарно через transaction)

### Логика обновления балансов

При успешном платеже:
```typescript
await this.paymentRepository.manager.transaction(async (transactionalEntityManager) => {
  // Update payment status
  payment.status = 'completed';
  await transactionalEntityManager.save(Payment, payment);

  // Deduct from sender
  if (payment.fromUserId) {
    await transactionalEntityManager.decrement(
      User,
      { id: payment.fromUserId },
      'balance',
      payment.amount,
    );
  }

  // Add to receiver
  if (payment.toUserId) {
    await transactionalEntityManager.increment(
      User,
      { id: payment.toUserId },
      'balance',
      payment.amount,
    );
  }
});
```

## Troubleshooting

### Ошибка: "Raw body is required for webhook signature verification"

**Решение:** Убедитесь, что в `main.ts` установлен `rawBody: true` при создании приложения.

### Ошибка: "Webhook signature verification failed"

**Причины:**
1. Неправильный webhook secret в .env
2. Body был модифицирован middleware
3. Используется production secret для test событий (или наоборот)

**Решение:**
- Проверьте, что используется правильный secret
- Для локальной разработки используйте secret из `stripe listen`
- Для production используйте secret из Stripe Dashboard

### Webhook возвращает 500

**Проверьте:**
1. Логи сервера для деталей ошибки
2. Существует ли payment в базе данных
3. Существуют ли users с указанными ID
4. База данных доступна

### События не обрабатываются

**Проверьте:**
1. `stripe listen` запущен и forwarding активен
2. Сервер запущен и доступен
3. Webhook secret правильно указан в .env
4. Firewall не блокирует подключения от Stripe

## Мониторинг

### Логи событий

Сервер логирует все обработанные события:
```
Handling checkout.session.completed: cs_test_...
Found payment: 1
Processing successful payment: ID=1, fromUserId=1, toUserId=2, amount=10.00
Payment marked as completed and balances updated: 1
```

### Stripe Dashboard

Проверяйте статус webhooks в:
- **Development:** Вывод `stripe listen` в терминале
- **Production:** https://dashboard.stripe.com/webhooks

### База данных

Мониторьте таблицу `payments`:
```sql
SELECT
  id,
  stripe_payment_intent_id,
  status,
  amount,
  from_user_id,
  to_user_id,
  created_at,
  updated_at
FROM payments
ORDER BY created_at DESC;
```

## Безопасность

### Best Practices

1. ✅ **Всегда верифицируйте подпись** - никогда не доверяйте webhook без проверки
2. ✅ **Используйте HTTPS** в production
3. ✅ **Храните секреты безопасно** - используйте переменные окружения
4. ✅ **Обрабатывайте дубликаты** - Stripe может отправить событие несколько раз
5. ✅ **Используйте транзакции** - для атомарного обновления данных
6. ✅ **Логируйте события** - для отладки и аудита
7. ✅ **Мониторьте ошибки** - настройте алерты для failed webhooks

### Idempotency

Stripe может отправить одно и то же событие несколько раз. Наша реализация обрабатывает это:
- Используем `stripe_payment_intent_id` как уникальный ключ
- Проверяем статус перед обновлением
- Транзакции БД гарантируют атомарность

## Полезные ссылки

- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks)
- [Stripe CLI Documentation](https://docs.stripe.com/stripe-cli)
- [Stripe Testing Guide](https://docs.stripe.com/testing)
- [Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices)
- [Stripe Event Types](https://docs.stripe.com/api/events/types)

---

**Создано:** 2025-10-11
**Автор:** Pickom Development Team
