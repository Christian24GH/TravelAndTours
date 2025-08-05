<?php

use App\Http\Controllers\Authentication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function(){
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/logout', function (Request $request) {
        if($request->user()->token()->revoke()){
            return response()->json(['message'=> 'User was logged out']);
        };

        return response()->json(['message'=> 'Request Failed'], 400);
    });

});

Route::post('/login', [Authentication::class, 'login']);


/**
 * 
 * 
 * eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTk4NjAwNS0xOTIwLTcwMWEtODFkNy1lM2YyZDdmMjRlNGQiLCJqdGkiOiIyMzUyNmQwMTExY2IwM2E4ZDVlNDY3YjhmYzI5ZGM0YjRjMDgzYmQzZWIwNDEwNTc5ZTFjYzY5NWEyYWQ0NjFjOTc2OTg0MTlkYmJhNmU4NSIsImlhdCI6MTc1NDAyMDYyOC4zOTAwMTQsIm5iZiI6MTc1NDAyMDYyOC4zOTAwMjIsImV4cCI6MTc4NTU1NjYyOC4yODgwMDgsInN1YiI6IjIiLCJzY29wZXMiOltdfQ.Pn2oMJt9_eg5oG0F76GHhjxzZK2e8pCeDmkb2xpwmeDeL_JneJfAaRMW6X3HexeI1q3AXQq_DgyDIVlnRKDX6URh9YcXQAvsh5d4_wGeD63E-upSbgkaN-iP9JTKSVBHrqde_ba2V-46Hw8sXOTGDzN50FI2TervsSsRSkFNhVViLi_BSlkzS7fnAft8jWoXO30-JirNqC_6BrwECfS-c5EPKg8oXOi8j8mUO8-D-kLx3Ow5SM4wrv-lh9gq5RuAA9P02aIAwsidhRYDG5hLZ0ef9EkYJ0aCA99HE1N07HBa75TyO9BHlNgUEm2I-4edGjh7iVtYPhNZUiinMVq9U8KTXqyit1L-05R2SCAXjfC07H_RkCWt-hEDPdCiPZTTzAB0rgGZ0ze3ko_wyLheEi0QQj81wAMNT9F-t8N0ZPhOoXyMdDboQqpaXD7P4fkfoLQ_0ROY_Zg09S-QJ9YOUJJnf7Ewxpa_16fRcZOv4ypNBzd5yn2LCJtHPre2K-yA7xzNg_Msv5fSf0nDG8-2wC9GVHaKLPmlIilC7-BYmlwfKzfQfTQFVkykz7qVJWrQ5ebqnoPr2kXqz15oOWWIUWkLqoDTPzK8bx1ILrWxNHNcjm1inHA3vJyQm6sneSGXXwdZ_KAwrtj3kUwJTqYTJI5o_j89dzljXgw_KHbWVGY
 */