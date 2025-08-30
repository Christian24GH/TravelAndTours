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
```bash
    cd (Backendfolder example. auth)
    composer i
    cp .env.example .env
    php artisan key:generate
    php artisan migrate
```

2. Frontend
```bash
    npm i
```
3. Auth Database
    Follow Backend setup then run. This will insert the Fleet Manager Account for LogisticsII
```bash
    php artisan db:seed
```
    Credentials
    Email: fleetManager@gmail.com
    Password: 123456

4. Start Laravel Reverb

```bash
    php artisan reverb:start
    
```

### Notes
Kahit mauna na ma-deploy yung backend namin sa internet para maaccess namin sa frontend. Yung frontend naman namin separate deployment yan dahil unified frontend na yan buong cluster so isa lang. Yung backend namin, marami po yan dahil microservice ang setup na gusto ng CRAD.

Yung Backend po namin nag-eexpose po yan ng mga APIs na nasa /routes/api.php. Kahit maaccess lang po muna namin yung URI ng backend api sa internet palag na kami. Later nalang po isetup yung frontend kapag fixed na APIs ng backend.

Right now sa localhost. Inaaccess po namin yung mga APIs using ```bash http://localhost:<port>/api/<api_name>``` kapag nirun namin yung php artisan serve. 

Lahat po ng exposed API na gagamitin ng frontend ay nakastore po sa frontend/src/api

Dun po namin yan babaguhin once up na yung hosting.

And about po sa mga .env(environment variables), may mga keys po kasi ako dun na private kaya hindi ko maisama sa remote repository. Gusto ko malaman kung may ibang way kami para magupload ng .env files.

Maraming salamat po at pasensya na magulo yung setup.




        


        