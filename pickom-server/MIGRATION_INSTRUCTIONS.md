# Инструкция по применению миграции базы данных

## Добавление колонки balance в таблицу users

### Важно
В текущей конфигурации проекта используется `synchronize: true` в TypeORM (файл `src/config/database.module.ts`), что означает автоматическую синхронизацию схемы базы данных с entity.

### Варианты применения миграции

#### Вариант 1: Автоматическая синхронизация (текущая настройка)
Если `synchronize: true` включен (как сейчас), то изменения в entity будут применены автоматически при запуске приложения:

```bash
npm run start:dev
```

TypeORM автоматически создаст колонку `balance` в таблице `users`.

**⚠️ Внимание:** `synchronize: true` безопасно использовать только в development режиме. На production это может привести к потере данных!

---

#### Вариант 2: Ручное применение миграции (рекомендуется для production)

##### Шаг 1: Отключить автоматическую синхронизацию
В файле `src/config/database.module.ts` измените:
```typescript
synchronize: false, // было true
migrations: ['dist/migrations/*.js'],
migrationsRun: false,
```

##### Шаг 2: Добавить скрипты для миграций в package.json
```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:run": "npm run typeorm migration:run -- -d src/config/data-source.ts",
    "migration:revert": "npm run typeorm migration:revert -- -d src/config/data-source.ts",
    "migration:generate": "npm run typeorm migration:generate -- -d src/config/data-source.ts",
    "migration:create": "npm run typeorm migration:create"
  }
}
```

##### Шаг 3: Создать data-source.ts для CLI
Создайте файл `src/config/data-source.ts`:
```typescript
import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Rating } from '../rating/entities/rating.entity';
import { Notification } from '../notification/entities/notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Delivery, Offer, Payment, Rating, Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
```

##### Шаг 4: Скомпилировать проект
```bash
npm run build
```

##### Шаг 5: Применить миграцию
```bash
npm run migration:run
```

##### Шаг 6: Откатить миграцию (если нужно)
```bash
npm run migration:revert
```

---

### Проверка применения миграции

После применения миграции проверьте структуру таблицы:

```sql
\d users
```

Или через SQL запрос:
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

---

### Что делает миграция

Миграция `1728489062000-AddBalanceToUser.ts` добавляет колонку `balance` в таблицу `users`:
- Тип: `decimal(10, 2)` - позволяет хранить суммы до 99,999,999.99
- Значение по умолчанию: `0`
- Not Nullable

---

### Изменения в коде

#### 1. User Entity (`src/user/entities/user.entity.ts`)
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

#### 2. Payment Service (`src/payment/payment.service.ts`)
В метод `handlePaymentIntentSucceeded` добавлена транзакция для обновления балансов:
- При успешном платеже сумма **вычитается** из баланса `fromUserId` (отправитель)
- При успешном платеже сумма **добавляется** к балансу `toUserId` (получатель)
- Операции выполняются атомарно в транзакции

---

### Пример использования

После успешного платежа:
```typescript
// Если payment.fromUserId = 1, payment.toUserId = 2, payment.amount = 100
// До: user1.balance = 500, user2.balance = 200
// После: user1.balance = 400, user2.balance = 300
```

---

### Рекомендации

1. **Development:** Можно оставить `synchronize: true` для быстрой разработки
2. **Production:** Обязательно использовать миграции вручную (`synchronize: false`)
3. Всегда проверяйте миграции на тестовой базе данных перед применением на production
4. Создавайте backup базы данных перед применением миграций на production
