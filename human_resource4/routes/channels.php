<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('employees_channel', function(){
    return true;
});

Broadcast::channel('maintenance_channel', function(){
    return true;
});

Broadcast::channel('payroll-updates', fn () => true);