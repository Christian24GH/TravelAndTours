# Instructions as of 9/4/2025
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
### [Backend]
    ALL BACKEND REQUEST SHOULD POINT AT [BACKEND]/public/index.html

    - auth          - Authentication Service, uses Laravel Sanctum for tokens
    - fleet_service - Logistics II, uses Laravel Reverb (Websocket)
    - logisticsI    - Logistics 1 backend uses laravel

    * waiting for other groups

### [Frontend]
    ALL NAVIGATION AND FRONTEND REQUEST SHOULD POINT AT frontend/dist/index.html
    For rewrite rule, follow instructions at frontend setup section

    - frontend      - Unified frontend folder for the whole section

### [Database]

    - Mariadb Initial pero pwede namin baguhin sa mga backends namin
    - [Backend]database/migrations - Location ng Database Blueprints namin.
    - [Backend] terminal, kapag na-setup na yung backend, run sa terminal
    
    php artisan migrate

## Setup Instructions
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
    APP_ENV=production #set to production
    APP_KEY=    # run php artisan key:generate
    APP_DEBUG=false #set to false in production
    APP_URL=http://subdomain.domain/public/ # ALL REQUEST SHOULD POINT AT public/ folder
    SERVER_PORT=8091    #localhost only

    SESSION_DRIVER=database
    SESSION_SAME_SITE=none
    SESSION_PARTITIONED_COOKIE=false

    DB_CONNECTION=mariadb
    DB_HOST=localhost
    DB_PORT=3306
    DB_DATABASE=auth
    DB_USERNAME=root
    DB_PASSWORD=
```

2. SETUP XAMPP AND FRONTEND FOR SINGLE PAGE APPLICATION

install node_modules
```bash
    npm install
```

Open xampp/apache/conf/httpd.conf
Enable LoadModule rewrite_module modules/mod_rewrite.so
```bash
    LoadModule rewrite_module modules/mod_rewrite.so # Uncommented
    <Directory "C:/xampp/htdocs">
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Require all granted
    </Directory>
```
Save and restart Apache Server

Open frontend/vite.config.js and modify base
```bash
    # Value depends on frontend serve directory
    # If app needs to be accessible at http://localhost/TravelAndTour/frontend/ → keep base: '/TravelAndTour/frontend/'.
    # if directory is htdocs/dist(http://localhost/) (directly from htdocs/dist) → change base: '/' and rebuild.
    
    # Sets assets(js/css) url for dist/index.html
    base: '/TravelAndTour/frontend/dist/'
```

Open frontend/src/main.jsx and modify basename\
```bash
    # basename = baseUrl jsut like base value inside vite.config.js
    # Tells BrowserRouter that this is the base URL to serve
    <BrowserRouter basename="/TravelAndTour/frontend/dist/">
```

Open frontend/public/.htaccess and modify
```bash
    <IfModule mod_rewrite.c>
        RewriteEngine On

        # Folder location, modify if needed
        RewriteBase /TravelAndTour/Frontend/

        # Serve existing files/directories as-is
        RewriteCond %{REQUEST_FILENAME} -f [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^ - [L]

        # Don't rewrite API requests (if proxied through same host)
        RewriteRule ^api/ - [L]

        # Don't rewrite static asset folders
        RewriteRule ^(assets|css|js|img|images|static)/ - [L]

        # Fallback to dist/index.html in this directory for SPA routes
        # Compiled index.html, tells browser to use this index with RewriteRule
        RewriteRule . dist/index.html [L]
    </IfModule>
```

Finally
```bash
    npm run build
```

This will create the dist folder. Inside is index.html, .htaccess, and compiled assets. yan dapat yung iseserve.
Kapag blank page, may mali sa main.jsx or .htaccess
If yung js or css ay 404 NOT FOUND, may mali sa vite.config.js

Create a .env
```bash
    VITE_AUTH_BACKEND: https://travelandtours-c9xk.onrender.com #replace with the auth backend url
```

3. Auth Database
Follow Backend setup then run. This will insert the Fleet Manager Account for LogisticsII
```bash
    php artisan db:seed
```
    Credentials
    Email: fleetManager@gmail.com
    Password: 123456

4. Setup auth/config/cors.php
add frontend url and other allowed origins in this array. Frontend URL can be placed in frontend/.env
```bash
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'new link here'
    ],
```
Or in auth/.env

```bash
    FRONTEND_URL=https://travelandtours-c9xk.onrender.com
```

5. Start Laravel Reverb on Supported Backends

```bash
    php artisan reverb:start
    
```




        


        
