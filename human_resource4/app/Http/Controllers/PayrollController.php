<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\PayrollCalculated;
use App\Events\PayrollProcessed;

class PayrollController extends Controller
{
    public function index(Request $req)
    {
        $q = $req->query('q');
        $status = $req->query('status');

        $query = DB::table('payrolls as p')
            ->select([
                'p.id','p.employee_id','p.pay_period_start','p.pay_period_end',
                'p.basic_salary','p.gross_salary','p.deductions','p.net_salary','p.status',
                'e.employee_code','e.first_name','e.last_name','e.email'
            ])
            ->join('employees as e', 'p.employee_id', '=', 'e.id')
            ->orderBy('p.created_at','desc');

        if ($q)   $query->where('e.first_name','like',"%$q%")
                          ->orWhere('e.last_name','like',"%$q%");
        if ($status) $query->where('p.status',$status);

        return $query->paginate(10);
    }

    public function show($id)
    {
        $payroll = DB::table('payrolls as p')
            ->select(['p.*','e.employee_code','e.first_name','e.last_name','e.email'])
            ->join('employees as e','p.employee_id','=','e.id')
            ->where('p.id',$id)
            ->first();
        $details = DB::table('payroll_details')->where('payroll_id',$id)->get();
        return response()->json(['payroll'=>$payroll,'details'=>$details]);
    }

    public function calculate(Request $r)
    {
        $r->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'pay_period_start' => 'required|date',
            'pay_period_end'   => 'required|date|after:pay_period_start',
        ]);

        $emp = DB::table('employees')->where('id',$r->employee_id)->first();
        $basic = $emp->salary;
        $gross = $basic;
        $deductions = 0;
        $net = $gross - $deductions;

        $id = DB::table('payrolls')->insertGetId([
            'employee_id'      => $emp->id,
            'pay_period_start' => $r->pay_period_start,
            'pay_period_end'   => $r->pay_period_end,
            'basic_salary'     => $basic,
            'gross_salary'     => $gross,
            'deductions'       => $deductions,
            'net_salary'       => $net,
            'status'           => 'calculated',
            'created_at'       => now(),
        ]);

        DB::table('payroll_details')->insert([
            ['payroll_id'=>$id,'component_type'=>'basic','component_name'=>'Basic Salary','amount'=>$basic,'is_deduction'=>0],
            ['payroll_id'=>$id,'component_type'=>'tax','component_name'=>'Income Tax','amount'=>0,'is_deduction'=>1],
        ]);

        $payroll = DB::table('payrolls')->find($id);
        broadcast(new PayrollCalculated($payroll))->toOthers();

        return response()->json(['message'=>'Payroll calculated','payroll'=>$payroll]);
    }

    public function process(Request $r,$id)
    {
        $r->validate(['payment_method'=>'required|in:bank_transfer,cash,cheque']);
        DB::table('payrolls')->where('id',$id)->update([
            'status'=>'processed',
            'payment_method'=>$r->payment_method,
            'processed_at'=>now(),
        ]);
        $payroll = DB::table('payrolls')->find($id);
        broadcast(new PayrollProcessed($payroll))->toOthers();
        return response()->json(['message'=>'Payroll processed']);
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id){
            DB::table('payroll_details')->where('payroll_id',$id)->delete();
            DB::table('payrolls')->where('id',$id)->delete();
        });
        return response()->json(['message'=>'Payroll deleted']);
    }
}