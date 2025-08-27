import { Stack } from 'expo-router'
export default function DispatchLayout(){
    return (
        <Stack>
            <Stack.Screen name='index' 
                options={{
                    title: "Dispatch",
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen name='(details)/[id]' 
                options={{
                    title: "Details",
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen name='(details)/(map)/index' 
                options={{
                    title: "Map",
                    headerShadowVisible: false,
                }}
            />
        </Stack>
    )
}