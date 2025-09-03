# Instructions as of 8/27/2025
# SETUP
Single Page Application + Cross Site Request

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
- logisticsI    - Logistics 1 backend uses laravel

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
```bash
    cd (Backendfolder example. auth)
    composer i
    cp .env.example .env
    php artisan key:generate
    php artisan migrate
```

modify .env
```bash
    #CONFIGURE FOR DEPLOYMENT
    APP_NAME=Laravel
    APP_ENV=production #set to production
    APP_KEY=    # run php artisan serve
    APP_DEBUG=true #set to false in production
    APP_URL=http://localhost #url
    SERVER_PORT=8091    #configure
    SANCTUM_STATEFUL_DOMAINS=localhost:5173   # add frontend domain here to allow csrf-tokens

    #Choose only one and disable the other
    #SESSION_DOMAIN=.onrender.com #For Render.com or any backend platform
    SESSION_DOMAIN= #for localhost 
    SESSION_DRIVER=cookie
    SESSION_SAME_SITE=none
    SESSION_PARTITIONED_COOKIE=false
```

2. Frontend
install node_modules
```bash
    npm install
    npm run build
```
This will create the dist folder. Inside is index.html, yan dapat yung iseserve.
Then for navigation, add/create redirect and rewrite rules, all request should point at dist/index.html

3. Auth Database
Follow Backend setup then run. This will insert the Fleet Manager Account for LogisticsII
```bash
    php artisan db:seed
```
    Credentials
    Email: fleetManager@gmail.com
    Password: 123456

4. Setup auth/config/cors.php
add frontend domain and other allowed origins in this array
```bash
    'allowed_origins' => ['http://localhost:5173',] 
    
```

5. Start Laravel Reverb on Supported Backends

```bash
    php artisan reverb:start
    
```

# Issues
    cors issue (Need Dedicated domain)

### Notes
Yung Backend po namin nag-eexpose po yan ng mga APIs na nasa /routes/api.php. Kahit maaccess lang po muna namin yung URI ng backend api sa internet palag na kami. Later nalang po isetup yung frontend kapag fixed na APIs ng backend.

Right now sa localhost. Inaaccess po namin yung mga APIs using 

```bash 
    http://localhost:<port>/api/<api_name>

``` 
kapag nirun namin yung php artisan serve. 

Lahat po ng exposed API na gagamitin ng frontend ay nakastore po sa frontend/src/api

Dun po namin yan babaguhin once up na yung hosting.

And about po sa mga .env(environment variables), may mga keys po kasi ako dun na private kaya hindi ko maisama sa remote repository. Gusto ko malaman kung may ibang way kami para magupload ng .env files.


Maraming salamat po at pasensya na magulo yung setup.






        


        