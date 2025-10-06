# Stripe Payment Integration

Интеграция Stripe платежной системы в проект Pickom.

## Структура

### Backend (NestJS)

- **Entity**: `pickom-server/src/payment/entities/payment.entity.ts`
- **DTOs**: `pickom-server/src/payment/dto/`
- **Service**: `pickom-server/src/payment/payment.service.ts`
- **Controller**: `pickom-server/src/payment/payment.controller.ts`
- **Module**: `pickom-server/src/payment/payment.module.ts`

### Frontend (Next.js)

- **Component**: `pickom-client/app/components/StripePaymentTest.tsx`
- **Test Page**: `pickom-client/app/test-payment/page.tsx`

## API Endpoints

### POST /payment/create-intent
Создает Payment Intent для оплаты доставки.

**Request:**
```json
{
  "amount": 10.00,
  "deliveryId": 1,
  "description": "Payment for delivery #1",
  "currency": "usd"
}
```

**Response:**
```json
{
  "paymentId": 1,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /payment/confirm
Подтверждает успешную оплату.

**Request:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

### POST /payment/webhook
Webhook для обработки событий от Stripe.

### GET /payment/user
Получает все платежи пользователя.

### GET /payment/:id
Получает платеж по ID.

## Переменные окружения

### Server (.env)
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Client (.env)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_SERVER=http://localhost:4242
```

## Тестирование

### 1. Запустите сервер
```bash
cd pickom-server
npm run start:dev
```

### 2. Запустите клиент
```bash
cd pickom-client
npm run dev
```

### 3. Откройте тестовую страницу
Перейдите на `http://localhost:3000/test-payment`

### 4. Тестовые карты Stripe

- **Успешная оплата**: `4242 4242 4242 4242`
- **Отклоненная карта**: `4000 0000 0000 0002`
- **Требуется аутентификация**: `4000 0025 0000 3155`
- **Недостаточно средств**: `4000 0000 0000 9995`

Используйте любую будущую дату истечения срока действия и любой CVC.

## Как использовать в коде

### Создание платежа

```typescript
import axios from 'axios';

const response = await axios.post(
  `${process.env.NEXT_PUBLIC_SERVER}/payment/create-intent`,
  {
    amount: 10.00,
    deliveryId: 1,
    description: 'Payment for delivery',
    currency: 'usd',
  }
);

const { clientSecret, paymentIntentId } = response.data;
```

### Подтверждение платежа

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement, // Stripe Card Element
      billing_details: {
        name: 'Customer Name',
      },
    },
  }
);

if (paymentIntent?.status === 'succeeded') {
  // Платеж успешен
  await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER}/payment/confirm`,
    { paymentIntentId }
  );
}
```

## Webhook Configuration

Для работы с webhook в production:

1. Настройте webhook endpoint в Stripe Dashboard: `https://yourdomain.com/payment/webhook`
2. Выберите события: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
3. Скопируйте signing secret в переменную окружения `STRIPE_WEBHOOK_SECRET`

## База данных

Необходимо выполнить миграцию для создания таблицы payments:

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  delivery_id INTEGER REFERENCES deliveries(id),
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER,
  amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_client_secret VARCHAR(255),
  currency VARCHAR(3) DEFAULT 'usd',
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Статусы платежа

- `pending` - Платеж создан, ожидает обработки
- `processing` - Платеж обрабатывается
- `completed` - Платеж успешно завершен
- `failed` - Платеж не прошел
- `cancelled` - Платеж отменен
