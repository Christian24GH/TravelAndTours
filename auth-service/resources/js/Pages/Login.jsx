import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; 

import axios from 'axios';

import { InputStyle, Input, WarningStyle } from './Components/Res';

export default function Login({ url, api_login, redirect_url }) {
    
    const [data, setData ] = useState({})
    const [err, setErr ] = useState({})
    
    function submit(e){

        e.preventDefault();
        NProgress.start();

        axios.post(api_login, data)
        .then(response => {
            
            console.log(response.data)
            console.log(redirect_url)

        }).catch(error=>{

            let ErrorStatus = error.response;
            if(error.response) console.log(error.response)

            setErr({})

            if(error.response.status === 401){
                setErr({
                    ...err,
                    Unauthorized: ErrorStatus.data.message,
                })
            }


            if(error.response.status === 422){
                setErr({
                    ...err,
                    email: ErrorStatus.data.errors.email,
                    password: ErrorStatus.data.errors.password
                })
                
            }


        }).finally(()=>{

            NProgress.done();

        })
       
    }
    
    return (
        <>
            <Head title={"Login"}/>
            
            <div className='w-screen h-screen flex items-center bg-gray-50'>

                <div className="w-lg mx-auto max-w-md rounded-lg bg-white shadow px-8 py-8">
                    
                    <div className='text-3xl text-center'>Login</div>
                    {(err.Unauthorized ? <label className={WarningStyle}>{err.Unauthorized}</label> : "")}
                    <form onSubmit={submit} className='space-y-5'>
                        <Input label="Email" 
                            id="email" 
                            placeholder="Your Email" 
                            name="email" type="email" 
                            className={InputStyle}
                            value={data.email || ''}
                            onChange={(e)=> setData({...data, email: e.target.value})} />
                        
                        {(err.email ? <label className={WarningStyle}>{err.email}</label> : "")}

                        <Input label="Password"
                            id="password"
                            name="password"
                            type="password"
                            className={InputStyle}
                            placeholder="Password"
                            value={data.password || ''}
                            onChange={(e)=>setData({...data, password: e.target.value})}/>

                        {(err.password ? <label className={WarningStyle}>{err.password}</label> : "")}

                        <div className='flex justify-end gap-5'>
                            <Link href={url} className="px-4 py-2 rounded text-white bg-gray-700">Don't have an account?</Link>
                            <button type="submit" className="px-4 py-2 rounded text-white bg-blue-500"> Submit </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
