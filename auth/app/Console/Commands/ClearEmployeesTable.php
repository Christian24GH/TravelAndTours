<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearEmployeesTable extends Command
{
    protected $signature = 'clear:employees';
    protected $description = 'Clears all data from the employees table.';

    public function handle()
    {
        DB::table('employees')->truncate();
        $this->info('Employees table has been truncated successfully.');
        return 0;
    }
}