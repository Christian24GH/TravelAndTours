import { View, Text, Button } from 'react-native'
import { Styles } from "@/components/Style";
import { useAuth } from '@/context/AuthProvider'

export default function AppOptionPage(){
    const {logout} = useAuth();
    return(
        <View style={Styles.container}>
            <Text>Setting</Text>
            <Button title='Logout'
                onPress={()=>logout()}/>
        </View>
    )
}