<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('vehicles', function () {
    return true;
});
