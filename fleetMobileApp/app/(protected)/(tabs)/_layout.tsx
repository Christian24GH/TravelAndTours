import { useAuth } from "@/context/AuthProvider";
import { Tabs } from "expo-router";
import { TruckIcon, HomeIcon, BoltIcon } from "lucide-react-native";
export default function TabLayout() {
  const {isLoggedIn} = useAuth()
  return (
    <Tabs>
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen name="index"
          options={{
            title: "Home",
            headerShadowVisible: false,
            tabBarIcon: ({focused}) => focused ? <HomeIcon fill="black"/>: <HomeIcon/>
          }}
        />
        <Tabs.Screen name="(dispatch)"
          options={{
            title: "Dispatch",
            headerShadowVisible: false,
            headerShown:false,
            tabBarIcon: ({focused}) => focused ? <TruckIcon fill="black"/>: <TruckIcon/>
          }}
          
        />
        <Tabs.Screen name="option-page"
          options={{
            title: "Options",
            headerShadowVisible: false,
            tabBarIcon: ({focused}) => focused ? <BoltIcon fill="black"/>: <BoltIcon/>
          }}
        />
      </Tabs.Protected>
    </Tabs>
  )
}
