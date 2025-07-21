# TravelAndTours Fullstack System

This is a fullstack Laravel project consisting of two main components:

1. **auth_service** - A Laravel API that handles authentication (e.g., login, token issuing).
2. **tatui** - The Laravel + Inertia (React) frontend that consumes the API and provides user interface logic.

---

## 🧱 Project Structure
travelandtours/
├── auth_service/ # Laravel API service for authentication
├── tatui/ # Laravel + Inertia frontend app
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
tatui/.env (Frontend App)

# Run this command per folder
```bash
    cd auth_service
    composer install
    cp .env.example .env
    php artisan key:generate
    php artisan migrate
    php artisan passport:install

    cd ../tatui
    composer install
    npm install
    cp .env.example .env
    php artisan key:generate
    php artisan migrate
    npm run dev

```
# at the tatui/.env add the following
```bash

DOMAIN=http://localhost/TravelAndTours  # Place the root folder path

```



