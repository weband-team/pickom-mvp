# 🔐 Seed Data - User Credentials & Database Records

## 📅 Created: 2025-10-20
## 🎯 Purpose: Test data for Pickom MVP with real PostgreSQL records

---

## 👥 Test Users (Firebase Authentication)

### User 1: Alice Johnson (Sender)
- **Email**: `alice.johnson@pickom.test`
- **Password**: `Alice2025!Sender`
- **Role**: Sender
- **Firebase UID**: Will be generated after creation
- **Phone**: +48111222333
- **Description**: Frequent sender, verified account, high rating

### User 2: Bob Smith (Picker)
- **Email**: `bob.smith@pickom.test`
- **Password**: `Bob2025!Picker`
- **Role**: Picker
- **Firebase UID**: Will be generated after creation
- **Phone**: +48222333444
- **Description**: Professional picker, 5-star rating, fast delivery

### User 3: Charlie Brown (Picker)
- **Email**: `charlie.brown@pickom.test`
- **Password**: `Charlie2025!Picker`
- **Role**: Picker
- **Firebase UID**: Will be generated after creation
- **Phone**: +48333444555
- **Description**: Student picker, reliable, eco-friendly bicycle delivery

### User 4: Diana Prince (Sender)
- **Email**: `diana.prince@pickom.test`
- **Password**: `Diana2025!Sender`
- **Role**: Sender
- **Firebase UID**: Will be generated after creation
- **Phone**: +48444555666
- **Description**: Business sender, bulk shipments

### User 5: Eve Martinez (Picker)
- **Email**: `eve.martinez@pickom.test`
- **Password**: `Eve2025!Picker`
- **Role**: Picker
- **Firebase UID**: Will be generated after creation
- **Phone**: +48555666777
- **Description**: Express delivery specialist, motorbike

---

## 📦 Sample Deliveries

### Delivery 1: Electronics Package
- **Title**: "Laptop Dell XPS 15"
- **Sender**: Alice Johnson
- **Picker**: Bob Smith
- **From**: Warsaw, Poland (52.2297, 21.0122)
- **To**: Krakow, Poland (50.0647, 19.9450)
- **Type**: Inter-city
- **Size**: Medium
- **Weight**: 2.5 kg
- **Price**: 45.00 PLN
- **Status**: Delivered
- **Created**: 2025-10-15
- **Delivered**: 2025-10-17

### Delivery 2: Documents
- **Title**: "Legal Documents - Urgent"
- **Sender**: Diana Prince
- **Picker**: Charlie Brown
- **From**: Warsaw Center (52.2297, 21.0122)
- **To**: Warsaw Mokotow (52.1806, 21.0251)
- **Type**: Within-city
- **Size**: Small
- **Weight**: 0.5 kg
- **Price**: 15.00 PLN
- **Status**: Delivered
- **Created**: 2025-10-18
- **Delivered**: 2025-10-18

### Delivery 3: Gift Package
- **Title**: "Birthday Gift - Flowers and Cake"
- **Sender**: Alice Johnson
- **Picker**: Eve Martinez
- **From**: Warsaw Praga (52.2532, 21.0398)
- **To**: Warsaw Ursynow (52.1391, 21.0491)
- **Type**: Within-city
- **Size**: Medium
- **Weight**: 3.0 kg
- **Price**: 25.00 PLN
- **Status**: Picked Up
- **Created**: 2025-10-20

### Delivery 4: Books
- **Title**: "University Textbooks (5 books)"
- **Sender**: Diana Prince
- **Picker**: Pending (no picker yet)
- **From**: Gdansk (54.3520, 18.6466)
- **To**: Warsaw (52.2297, 21.0122)
- **Type**: Inter-city
- **Size**: Large
- **Weight**: 5.0 kg
- **Price**: 60.00 PLN
- **Status**: Pending
- **Created**: 2025-10-19

### Delivery 5: Food Delivery
- **Title**: "Fresh Groceries from Organic Market"
- **Sender**: Alice Johnson
- **Picker**: Charlie Brown
- **From**: Warsaw Bemowo (52.2402, 20.9185)
- **To**: Warsaw Wola (52.2401, 20.9802)
- **Type**: Within-city
- **Size**: Medium
- **Weight**: 4.0 kg
- **Price**: 20.00 PLN
- **Status**: Accepted
- **Created**: 2025-10-20

---

## 💰 Sample Offers

### Offer 1: Bob Smith → Delivery 4 (Books)
- **Picker**: Bob Smith
- **Delivery**: Books (Gdansk → Warsaw)
- **Price**: 55.00 PLN (5 PLN discount)
- **Message**: "I'm heading to Warsaw tomorrow, can deliver safely!"
- **Status**: Pending
- **Created**: 2025-10-19

### Offer 2: Eve Martinez → Delivery 4 (Books)
- **Picker**: Eve Martinez
- **Delivery**: Books (Gdansk → Warsaw)
- **Price**: 60.00 PLN
- **Message**: "Professional courier with tracking, delivery within 24h"
- **Status**: Pending
- **Created**: 2025-10-19

---

## 📍 Sample Tracking Updates

### Tracking for Delivery 1 (Laptop)
1. **Pending** - 2025-10-15 10:00 - "Delivery request created"
2. **Accepted** - 2025-10-15 11:30 - "Bob Smith accepted the delivery"
3. **Picked Up** - 2025-10-15 14:00 - Location: (52.2297, 21.0122)
4. **Delivered** - 2025-10-17 10:30 - Location: (50.0647, 19.9450)

### Tracking for Delivery 2 (Documents)
1. **Pending** - 2025-10-18 09:00
2. **Accepted** - 2025-10-18 09:15
3. **Picked Up** - 2025-10-18 10:00 - Location: (52.2297, 21.0122)
4. **Delivered** - 2025-10-18 11:30 - Location: (52.1806, 21.0251)

### Tracking for Delivery 3 (Gift)
1. **Pending** - 2025-10-20 08:00
2. **Accepted** - 2025-10-20 08:30
3. **Picked Up** - 2025-10-20 09:15 - Location: (52.2532, 21.0398)

---

## 🔔 Sample Notifications

### For Alice Johnson (Sender):
1. "Your delivery 'Laptop Dell XPS 15' has been delivered!" - Read
2. "Bob Smith accepted your delivery request" - Read
3. "Your delivery 'Gift Package' is on the way" - Unread

### For Bob Smith (Picker):
1. "New delivery request available in Warsaw-Krakow route" - Read
2. "Payment received: 45.00 PLN for Delivery #1" - Read

### For Diana Prince (Sender):
1. "2 new offers for your Books delivery" - Unread
2. "Your Documents delivery has been completed" - Read

---

## ⭐ Sample Ratings

### Rating 1: Alice → Bob (for Laptop delivery)
- **From**: Alice Johnson
- **To**: Bob Smith
- **Delivery**: Laptop Dell XPS 15
- **Rating**: 5.0
- **Comment**: "Excellent service! Laptop arrived safely and on time. Highly recommend Bob!"

### Rating 2: Diana → Charlie (for Documents delivery)
- **From**: Diana Prince
- **To**: Charlie Brown
- **Delivery**: Legal Documents
- **Rating**: 5.0
- **Comment**: "Super fast delivery! Documents arrived within 2 hours. Thank you!"

### Rating 3: Alice → Eve (for Gift - future)
- **From**: Alice Johnson
- **To**: Eve Martinez
- **Delivery**: Birthday Gift
- **Rating**: Pending (not delivered yet)

---

## 💳 Sample Payments

### Payment 1: Alice → Bob
- **From**: Alice Johnson
- **To**: Bob Smith
- **Delivery**: Laptop Dell XPS 15
- **Amount**: 45.00 PLN
- **Status**: Completed
- **Method**: Card
- **Date**: 2025-10-17

### Payment 2: Diana → Charlie
- **From**: Diana Prince
- **To**: Charlie Brown
- **Delivery**: Legal Documents
- **Amount**: 15.00 PLN
- **Status**: Completed
- **Method**: Cash
- **Date**: 2025-10-18

---

## 📊 User Statistics (After Seeding)

### Alice Johnson:
- Total Orders: 3
- Completed Deliveries: 2
- Average Rating: N/A (sender)
- Balance: -80.00 PLN (spent)

### Bob Smith:
- Total Orders: 1
- Completed Deliveries: 1
- Average Rating: 5.0
- Balance: +45.00 PLN (earned)

### Charlie Brown:
- Total Orders: 2
- Completed Deliveries: 1
- Average Rating: 5.0
- Balance: +15.00 PLN (earned)

### Diana Prince:
- Total Orders: 2
- Completed Deliveries: 1
- Average Rating: N/A (sender)
- Balance: -15.00 PLN (spent)

### Eve Martinez:
- Total Orders: 1
- Completed Deliveries: 0 (in progress)
- Average Rating: N/A (no completed deliveries)
- Balance: 0.00 PLN

---

## 🗄️ Database Tables Populated

✅ **users** - 5 users
✅ **deliveries** - 5 deliveries
✅ **offers** - 2 offers
✅ **delivery_tracking** - 10 tracking updates
✅ **notifications** - 6 notifications
✅ **ratings** - 2 ratings
✅ **payments** - 2 payments

---

## 🔧 How to Use This Data

### 1. Login as Sender (Alice):
```
Email: alice.johnson@pickom.test
Password: Alice2025!Sender
```
- View your sent deliveries
- Create new delivery requests
- Review delivered packages

### 2. Login as Picker (Bob):
```
Email: bob.smith@pickom.test
Password: Bob2025!Picker
```
- View available deliveries
- Accept delivery requests
- Update delivery status

### 3. Test Order Flow:
- Login as Diana
- View "Books" delivery (#4)
- See 2 pending offers
- Accept an offer
- Track delivery progress

---

## ⚠️ Important Notes

1. **Firebase UIDs**: Will be auto-generated when users are created in Firebase
2. **Timestamps**: All dates are in UTC timezone
3. **Locations**: Using real coordinates for Polish cities
4. **Prices**: In Polish Zloty (PLN)
5. **Phone Numbers**: Fictional but valid format for Poland (+48)

---

## 🚀 Next Steps

1. Run seed script to populate database
2. Create Firebase users with provided credentials
3. Update user records with Firebase UIDs
4. Test login with each user
5. Verify all data displays correctly in UI

---

**Status**: ✅ Ready for database seeding
**Last Updated**: 2025-10-20
