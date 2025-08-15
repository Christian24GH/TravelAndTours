<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('vehicle_channel', function(){
    return true;
});

Broadcast::channel('maintenance_channel', function(){
    return true;
});