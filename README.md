# Instructions as of 8/27/2025

##  Teck stack
    - Xampp
    - MariaDB (Pwede mabago)
    - Laravel Framework with Reverb and Sanctum Package (Backend)
    - ReactJs (Frontend)
    - Shadcn  (UI Component Template)
    - Tailwind

##  Structure
[Backend]
- auth          - Authentication Service, uses Laravel Sanctum for tokens
- fleet_service - Logistics II, uses Laravel Reverb (Websocket)

* waiting for other groups

[Frontend]
    - frontend      - Unified frontend folder for the whole section

[Database]
    - Mariadb Initial pero pwede namin baguhin sa mga backends namin
    - [Backend]database/migrations - Location ng Database Blueprints namin.
    - [Backend] terminal, kapag na-setup na yung backend, run sa terminal

    ```bash
    php artisan migrate
    ```

##  Commands
1. Backend Setup
- cd <Backendfolder ex. auth>
- composer i
- cp .env.example .env
- php artisan key:generate
- php artisan migrate

2. Frontend
- npm i
3. Migrate Database

```bash
    php artisan migrate
```
4. Start Laravel Reverb

```bash
    php artisan reverb:start
```
    
    


        


        