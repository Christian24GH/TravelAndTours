import { useRouter } from "expo-router"
import { useContext, createContext, useState, useEffect } from "react"
import axios from '@/api/axios'

import { ToastAndroid, Platform, AlertIOS} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AuthContext = createContext()

function notifyMessage(msg) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT)
  } else {
    AlertIOS.alert(msg);
  }
}

export const AuthProvider = ({children}) => {
    const [session, setSession] = useState()
    const [token, setToken] = useState()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const router = useRouter()
    
    useEffect(() => {
      const restoreSession = async () => {
        try {
          const stored = await AsyncStorage.getItem("token")
          if (stored) {
            const parsed = JSON.parse(stored)
            
            const res = await axios.get("/api/user", {
              headers: { Authorization: `Bearer ${parsed}` },
            });
            setSession(res.data)
            setIsLoggedIn(true)
            router.replace('/')
          }
        } catch (e) {
          console.log("restore session failed", e);
          setSession(null)
          setToken(null)
        } finally {
          setIsReady(true)
        }
      };

      restoreSession();
    }, [token]);
    
    const storeToken = async (data) => {
      try{
        await AsyncStorage.setItem('token', JSON.stringify(data))
      }catch(e){
        console.log('Error Saving', e)
      }
    }

    const login = async (token) => {
      try {
        storeToken(token)
        setToken(token)
      } catch (e) {
        console.log('Login error', e)
      }
    }

    const logout = () => {
      setIsLoggedIn(false)
      storeToken(null)
      setSession(null)
    }

    const roleAccess = () => {

    }

    return (
        <AuthContext.Provider value={{isReady, session, isLoggedIn, login, logout, roleAccess}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
