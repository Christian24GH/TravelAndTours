import { useAuth } from '@/context/AuthProvider'
import { Redirect, Stack, Slot } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
export default function AuthLayout(){
    const { isLoggedIn, isReady } = useAuth()

    if(!isReady){
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    }

    if(!isLoggedIn){
        return <Redirect href="/sign-in"/>
    }

    return <Slot/>
}