<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class PayrollProcessed implements ShouldBroadcast
{
    use Dispatchable;
    public $payroll;
    public function __construct($payroll){ $this->payroll = $payroll; }
    public function broadcastOn(){ return new Channel('payroll-updates'); }
}