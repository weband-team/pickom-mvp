# Тест создания Tracking

## Почему tracking может быть пустым?

### 1. Нет доставок со статусом 'accepted'
Tracking создается ТОЛЬКО когда статус delivery меняется на 'accepted' (picker принимает заказ).

**Проверьте:**
```sql
SELECT id, status, pickerId FROM delivery;
```

Если все доставки имеют статус 'pending', tracking не создастся.

### 2. Проверка через API

**Шаг 1: Создайте доставку**
```bash
POST http://localhost:4242/delivery
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Test Delivery",
  "fromLocation": {
    "lat": 55.7558,
    "lng": 37.6173,
    "address": "Moscow"
  },
  "toLocation": {
    "lat": 55.7558,
    "lng": 37.6173,
    "address": "Moscow"
  },
  "price": 100,
  "size": "medium"
}
```

**Шаг 2: Примите доставку как picker**
```bash
PATCH http://localhost:4242/delivery/{id}/status
Content-Type: application/json
Authorization: Bearer PICKER_TOKEN

{
  "status": "accepted"
}
```

**Шаг 3: Проверьте tracking**
```bash
GET http://localhost:4242/tracking/{deliveryId}
Authorization: Bearer YOUR_TOKEN
```

### 3. Проверка логов сервера

После того как picker примет заказ, вы должны увидеть в логах:
```
[DeliveryService] Created tracking for delivery 12
```

Если видите ошибку вместо этого сообщения, проверьте:
- Есть ли у delivery `fromLocation` и `toLocation`
- Есть ли у delivery `pickerId`

### 4. Ручная проверка через базу данных

```sql
-- Проверить delivery
SELECT id, status, "pickerId", "senderId", "recipientId", "fromLocation", "toLocation"
FROM delivery
WHERE status = 'accepted';

-- Проверить tracking
SELECT * FROM tracking;

-- Проверить связь
SELECT
  d.id as delivery_id,
  d.status,
  t.id as tracking_id,
  t."pickerLocation"
FROM delivery d
LEFT JOIN tracking t ON t."deliveryId" = d.id
WHERE d.status IN ('accepted', 'picked_up');
```

### 5. Быстрый тест

Если у вас уже есть delivery с status='pending':

1. Откройте приложение как picker (uid: '2' или '3')
2. Найдите доставку
3. Нажмите "Accept" (принять)
4. Проверьте таблицу tracking в базе данных

После этого tracking должен автоматически создаться!
