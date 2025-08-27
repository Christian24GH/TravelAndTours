import { useAuth } from '@/context/AuthProvider'
import { Redirect, Stack, Slot } from 'expo-router'
export default function AuthLayout(){
    const { isLoggedIn, isReady } = useAuth()

    if(!isReady){
        return null
    }
    if(!isLoggedIn){
        return <Redirect href="/sign-in"/>
    }
    return <Slot/>
}