# Quick Start Guide

## 🚀 Start Development

### Backend
```bash
cd pickom-server
npm install
npm run start:dev
# Server runs on http://localhost:4242
# Swagger docs at http://localhost:4242/api
```

### Frontend
```bash
cd pickom-client
npm install
npm run dev
# Client runs on http://localhost:3000
```

### Database
Ensure PostgreSQL is running and configured in `.env`

---

## 📋 Starting a New Task

### 1. Choose Task
Review: `.claude/tasks/remaining-tasks-2025-10-21/PRIORITY.md`

### 2. Create Branch
```bash
git checkout -b feature/task-name
```

### 3. Follow Task Plan
Each major task has detailed breakdown in:
- `TASK-3-PAYMENT-INTEGRATION.md`
- `TASK-5-REALTIME-UPDATES.md` (coming soon)
- etc.

### 4. Commit & Push
```bash
git add .
git commit -m "feat: brief description"
git push origin feature/task-name
```

---

## 🔧 Common Commands

### Backend
```bash
# Development
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Tests
npm run test

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🧪 Testing

### Stripe CLI (for payment testing)
```bash
stripe login
stripe listen --forward-to localhost:4242/payment/webhook
```

### Test Stripe Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## 📚 Documentation

- **API Docs**: http://localhost:4242/api
- **Task Plans**: `.claude/tasks/remaining-tasks-2025-10-21/`
- **Project Status**: `PROJECT-STATUS.md`
- **Priority Tasks**: `PRIORITY.md`

---

## 🆘 Common Issues

### Port Already in Use
```bash
# Kill process on port 4242 (backend)
npx kill-port 4242

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Database Connection Error
Check `.env` file has correct database credentials

### Firebase Auth Error
Ensure `FIREBASE_*` variables are set in `.env`

---

## ✅ Checklist Before Starting Work

- [ ] Latest code pulled: `git pull origin frontend-backend-integration`
- [ ] Backend running: http://localhost:4242/api
- [ ] Frontend running: http://localhost:3000
- [ ] Database connected
- [ ] Task plan reviewed
- [ ] Branch created

---

## 🎯 Current Focus

**Next Task**: Payment Integration (Stripe)
**See**: `TASK-3-PAYMENT-INTEGRATION.md`
