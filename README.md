# TravelAndTours Fullstack System
## 🧱 Project Structure
travelandtours/
├── auth_service/ # Laravel API service for authentication
├── Sub-system/ # Laravel + Inertia frontend app
└── README.md

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Christian24GH/TravelAndTours.git
cd travelandtours

```
### 2. Configure Environments
You will need two .env files — one for each Laravel app.

auth_service/.env (API)
template/.env (Frontend App)

### 3. Configure Database in .env file
```bash
    DB_CONNECTION=mariadb
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=template # Palitan ng DB name niyo
    DB_USERNAME=root
    DB_PASSWORD=
```

# Run this command on template folder
``` bash
    cd ../template
    composer install
    npm install
    cp .env.example .env
    php artisan key:generate
    php artisan migrate
    npm run dev
```



