# Pickom API Endpoints

# Architecture
- Repository creation
- NestJS deployment
- CORS policy configuration
- Pipeline setup
- Database deployment
- Database connection
- ESLint configuration
- Swagger
- Database design

Integration with payment system

## 🔥 CRITICAL ENDPOINTS (without them the application doesn't work)

### Authentication and Users
- `POST /auth/register` - User registration
- `POST /auth/login` - User authorization
- `POST /auth/verify` - User verification
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Main Delivery Flow

 -                             Selection of possible pickers
- `POST /delivery/requests` - Create delivery offer to specific picker (sender)
- `GET /delivery/requests` - Get list of delivery requests
-   notification 
- `GET /delivery/requests/{id}` - Get detailed information about request
- `PUT /delivery/request/{id}/` - Accept/decline offer (picker) -> create offer
- Get all current offers
- Get information about specific offer


### Delivery Tracking
- Delivery status update -> offer status changes -> logs 
- Picker location tracking

### Ratings and Reviews
- Create review
- Get reviews about picker

### Wallet 
-  Card binding
-  Balance display (picker)
-  Funds withdrawal (picker)
-  Money transfer from sender to picker
---