# Инструкция по применению миграций базы данных

## Миграции в проекте

### 1. AddBalanceToUser (1728489062000)
Добавляет колонку `balance` в таблицу `users` для хранения баланса пользователя.

### 2. UpdatePaymentTable (1728489100000)
Обновляет таблицу `payments` для интеграции со Stripe:
- Делает `delivery_id` и `to_user_id` nullable
- Добавляет статусы `processing` и `cancelled`
- Добавляет поля для Stripe: `stripe_payment_intent_id`, `stripe_client_secret`
- Добавляет поля: `currency`, `description`, `metadata`
- Добавляет поле `updated_at`

---

## Важно
В текущей конфигурации проекта используется `synchronize: true` в TypeORM (файл `src/config/database.module.ts`), что означает автоматическую синхронизацию схемы базы данных с entity.

---

## Варианты применения миграций

### Вариант 1: Автоматическая синхронизация (текущая настройка)
Если `synchronize: true` включен (как сейчас), то изменения в entity будут применены автоматически при запуске приложения:

```bash
npm run start:dev
```

TypeORM автоматически создаст все необходимые колонки.

**⚠️ Внимание:** `synchronize: true` безопасно использовать только в development режиме. На production это может привести к потере данных!

---

### Вариант 2: Ручное применение миграций (рекомендуется для production)

#### Шаг 1: Отключить автоматическую синхронизацию
В файле `src/config/database.module.ts` измените:
```typescript
synchronize: false, // было true
migrations: ['dist/migrations/*.js'],
migrationsRun: false,
```

#### Шаг 2: Скомпилировать проект
```bash
npm run build
```

#### Шаг 3: Применить миграции
```bash
npm run migration:run
```

#### Шаг 4: Откатить последнюю миграцию (если нужно)
```bash
npm run migration:revert
```

---

## Доступные скрипты миграций

В `package.json` добавлены следующие скрипты:

- `npm run migration:run` - Применить все непримененные миграции
- `npm run migration:revert` - Откатить последнюю миграцию
- `npm run migration:generate -- src/migrations/MigrationName` - Сгенерировать миграцию на основе изменений в entities
- `npm run migration:create -- src/migrations/MigrationName` - Создать пустую миграцию

---

## Проверка применения миграций

### Проверка таблицы users
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'balance';
```

Должна появиться колонка:
- **Имя:** `balance`
- **Тип:** `NUMERIC(10,2)`
- **По умолчанию:** `0`
- **Nullable:** `NO`

### Проверка таблицы payments
```sql
\d payments
```

Должны появиться колонки:
- `stripe_payment_intent_id` (varchar, unique, nullable)
- `stripe_client_secret` (varchar, nullable)
- `currency` (varchar(3), default 'usd')
- `description` (text, nullable)
- `metadata` (json, nullable)
- `updated_at` (timestamp)

---

## Что делают миграции

### 1. AddBalanceToUser
Добавляет колонку `balance` в таблицу `users`:
- Тип: `decimal(10, 2)` - позволяет хранить суммы до 99,999,999.99
- Значение по умолчанию: `0`
- Not Nullable

### 2. UpdatePaymentTable
Обновляет таблицу `payments` для поддержки:
- Stripe платежей (payment intent, client secret)
- Расширенной информации о платеже (описание, метаданные)
- Дополнительных статусов платежа
- Nullable полей для гибкости

---

## Изменения в коде

### User Entity (`src/user/entities/user.entity.ts`)
Добавлена колонка:
```typescript
@ApiProperty()
@Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  default: 0,
})
balance: number;
```

### Payment Entity (`src/payment/entities/payment.entity.ts`)
Добавлены новые поля для Stripe интеграции и расширенной информации.

### Payment Service (`src/payment/payment.service.ts`)
В метод `handlePaymentIntentSucceeded` добавлена транзакция для обновления балансов:
- При успешном платеже сумма **вычитается** из баланса `fromUserId` (отправитель)
- При успешном платеже сумма **добавляется** к балансу `toUserId` (получатель)
- Операции выполняются атомарно в транзакции

---

## Пример использования

После успешного платежа:
```typescript
// Если payment.fromUserId = 1, payment.toUserId = 2, payment.amount = 100
// До: user1.balance = 500, user2.balance = 200
// После: user1.balance = 400, user2.balance = 300
```

---

## Рекомендации

1. **Development:** Можно оставить `synchronize: true` для быстрой разработки
2. **Production:** Обязательно использовать миграции вручную (`synchronize: false`)
3. Всегда проверяйте миграции на тестовой базе данных перед применением на production
4. Создавайте backup базы данных перед применением миграций на production
5. После применения миграций убедитесь, что в `.env` настроены переменные для Stripe:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

---

## Конфигурация TypeORM

Файл `src/config/data-source.ts` содержит конфигурацию для CLI команд миграций.
Файл `src/config/database.module.ts` содержит конфигурацию для приложения NestJS.
