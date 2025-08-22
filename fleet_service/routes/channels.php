<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('vehicle_channel', function(){
    return true;
});

Broadcast::channel('maintenance_channel', function(){
    return true;
});

Broadcast::channel('reservation_channel', function(){
    return true;
});

Broadcast::channel('dispatchChannel', function(){
    return true;
});