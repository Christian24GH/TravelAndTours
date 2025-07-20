import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios';

import { InputStyle, Input, WarningStyle } from './Components/Res'

export default function Register({url, api_register}){
    const [data, setData] = useState({})
    const [errorMsg, setErrorMsg] = useState({})

    const submit = (e) => {
        e.preventDefault()

        NProgress.start()
        axios.post(api_register, data)
        .then(response => {
            //login the created account
            alert('Account Created')
        }).catch(errors => {
            let status = errors.response.data.errors
            if(errors.status === 422){
                setErrorMsg({
                    ...errorMsg,
                    email: status.email,
                    password: status.password,
                    name: status.name
                })
            }
        }).finally(()=>{
            NProgress.done()
        })
    }

    return <>
        <Head title="Register"/>
        <div className='w-screen h-screen flex items-center bg-gray-50'>
            <div className="w-lg mx-auto max-w-md rounded-lg bg-white shadow px-8 py-8">
                
                <div className='text-3xl text-center'>Register</div>
                {(errorMsg.Unauthorized ? <label className={WarningStyle}>{errorMsg.Unauthorized}</label> : "")}
                <form onSubmit={submit} className='space-y-5'>
                    <Input label="Name" 
                        id="name" 
                        placeholder="Your Name" 
                        name="name" type="text" 
                        className={InputStyle}
                        value={data.name || ''}
                        onChange={(e)=> setData({...data, name: e.target.value})} />
                    
                    {(errorMsg.email ? <label className={WarningStyle}>{errorMsg.name}</label> : "")}

                    <Input label="Email" 
                        id="email" 
                        placeholder="Your Email" 
                        name="email" type="email" 
                        className={InputStyle}
                        value={data.email || ''}
                        onChange={(e)=> setData({...data, email: e.target.value})} />
                    
                    {(errorMsg.email ? <label className={WarningStyle}>{errorMsg.email}</label> : "")}

                    <Input label="Password"
                        id="password"
                        name="password"
                        type="password"
                        className={InputStyle}
                        placeholder="Password"
                        value={data.password || ''}
                        onChange={(e)=>setData({...data, password: e.target.value})}/>

                    {(errorMsg.password ? <label className={WarningStyle}>{errorMsg.password}</label> : "")}

                    <div className='flex justify-end gap-5'>
                        <Link href={url} className="px-4 py-2 rounded text-white bg-gray-700">Already have an account?</Link>
                        <button type="submit" className="px-4 py-2 rounded text-white bg-green-500"> Register </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}