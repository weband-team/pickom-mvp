# Pickom MVP - Deployment

## VPS Setup

```bash
# Install required software
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/www/pickom-mvp
sudo chown -R $USER:$USER /var/www/pickom-mvp
mkdir -p /var/www/pickom-mvp/logs
```

## PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE pickom_mvp;
CREATE USER pickom_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE pickom_mvp TO pickom_user;
\c pickom_mvp
GRANT ALL ON SCHEMA public TO pickom_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pickom_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pickom_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pickom_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pickom_user;
\q

# Test connection
psql -U pickom_user -d pickom_mvp -h localhost
```

**Save the password - needed for GitHub Secrets!**

## Nginx

```bash
# Create config
sudo nano /etc/nginx/sites-available/pickom
```

Paste:
```nginx
server {
    listen 80;
    server_name pickom.qirelab.com;

    client_max_body_size 50M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    location / {
        proxy_pass http://localhost:3909;
    }
}
```

```bash
# Enable and reload
sudo ln -s /etc/nginx/sites-available/pickom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d pickom.qirelab.com
```

## SSH Key for Deploy

```bash
# On local machine
ssh-keygen -t ed25519 -C "pickom-deploy" -f ~/.ssh/pickom_deploy
# Don't set passphrase (press Enter twice)

# Copy public key
cat ~/.ssh/pickom_deploy.pub

# On VPS
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Test from local
ssh -i ~/.ssh/pickom_deploy user@vps-ip
```

## GitHub Secrets

**Settings → Secrets and variables → Actions → New repository secret**

### 1. VPS Connection
- `VPS_HOST` = `95.123.45.67` (your VPS IP)
- `VPS_USERNAME` = `max` (your SSH user)
- `VPS_KEY` = copy output of `cat ~/.ssh/pickom_deploy` (include BEGIN/END lines)
- `VPS_PORT` = `22` (optional, if not 22)

### 2. Application Config

**`ENV_FILE_CLIENT`** - copy from `pickom-client/.env.prod`:
```env
NEXT_PUBLIC_API_URL=https://pickom.qirelab.com
NEXT_PUBLIC_SERVER=http://localhost:3910
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDiclg8XNo2L1hDBoaSoHmFMBggUKYjHH4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pickom-mvp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pickom-mvp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pickom-mvp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=168767828055
NEXT_PUBLIC_FIREBASE_APP_ID=1:168767828055:web:2853961b44970c114ab312
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-V1HMPS55XY
NODE_ENV=production
PORT=3909
```

**`ENV_FILE_SERVER`** - copy from `pickom-server/.env.prod` and **UPDATE DATABASE_URL**:
```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=pickom-mvp
FIREBASE_PRIVATE_KEY_ID=db5400cee9cf19bb9c1cdbffa9464e53317f764e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...YOUR_KEY...Ngc=\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pickom-mvp.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=100402824601448822350
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pickom-mvp.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
CLIENT_URI=https://pickom.qirelab.com
DATABASE_URL=postgresql://pickom_user:YOUR_DB_PASSWORD@localhost:5432/pickom_mvp
STRIPE_SECRET_KEY=sk_test_51SG0N6GyRpOUvZeEM8yeI8UDEfvmdgSYEV5b1uc6Jo7r8OfcLm1FDjTEjiv7zvjstFfiw02MvQ3hAYmvbFvCEVch00eg8Mou8s
STRIPE_WEBHOOK_SECRET=whsec_eaf5f8dc83841b84b74aafcec775bf39538570900fdb4e5a43e0198143bdf9f0
NODE_ENV=production
PORT=3910
```

## Deploy

```bash
# Push to master = auto deploy
git push origin master

# Or manual: GitHub → Actions → Deploy Pickom MVP to VPS → Run workflow
```

## Useful Commands

```bash
# VPS - Check status
pm2 list
pm2 logs pickom-client
pm2 logs pickom-server

# VPS - Restart
pm2 restart pickom-client
pm2 restart pickom-server

# VPS - Check files
ls -la /var/www/pickom-mvp/pickom-client/.env.local
ls -la /var/www/pickom-mvp/pickom-server/.env

# VPS - Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/pickom-error.log

# VPS - Database
psql -U pickom_user -d pickom_mvp -h localhost
```

## Troubleshooting

```bash
# Deployment failed → Check GitHub Actions logs
# App not starting → pm2 logs pickom-server
# DB connection error → check DATABASE_URL in /var/www/pickom-mvp/pickom-server/.env
# Port in use → sudo lsof -i :3909 or :3910
```

---

**Deploy workflow:** `.github/workflows/deploy.yml` (already created)

**Architecture:**
- Client: localhost:3909
- Server: localhost:3910
- Public: https://pickom.qirelab.com (Nginx → Client)
