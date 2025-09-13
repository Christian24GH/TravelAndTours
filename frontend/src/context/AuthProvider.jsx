import {createContext, useState, useEffect } from "react";
import api, { login as apiLogin, logout as apiLogout, removeToken } from "../api/axios"; //TOKEN BASED
import { toast } from "sonner";
import { useNavigate } from "react-router";

const AuthContext = createContext({})

export const AuthProvider = ({children})=>{
    const [auth, setAuth] = useState(null)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // token-based: api already boots token from storage
                const response = await api.get("/user")
                setAuth(response.data) // user object returned by backend
                console.log(response)
            } catch (error) {
                // token invalid or not present
                removeToken()
                setAuth(null)
            } finally {
                setLoading(false);
            }
        }
        checkAuth()
    }, [])

    const login = async (data) => {
        try {
            // call the API login helper which returns { token, user }
            const res = await apiLogin(data)
            const user = res?.user
            if (res?.token) {
                setAuth(user)
                toast.success('Login successful, redirecting...', { position: "top-center" })
                roleAccess(user, navigate)
            } else {
                toast.error('Login failed: no token returned', { position: "top-center" })
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422 || error.response.status === 401) {
                    toast.error('Invalid credentials', { position: "top-center" })
                } else if (error.response.status === 500) {
                    toast.error('Server error. Please try again later.', { position: "top-center" })
                } else {
                    toast.error(`Login failed (${error.response.status})`, { position: "top-center" })
                }
            } else {
                toast.error('Network error. Please check your connection.', { position: "top-center" })
            }
            console.log(error)
        }
    }
    
    const roleAccess = (user, navigate) => {
        switch (user?.role) {
            case 'Super Admin':
                navigate('/login');
                break;
            case 'LogisticsII Admin':
            case 'Driver':
            case 'Employee':
                navigate('/logisticsII/');
                break;
            case 'LogisticI Admin':
                navigate('/logistics1/');
                break;
            default:
                navigate('/login');
        }
    }

    const logout = async () => {
        try {
            await apiLogout()
        } catch (_) {
            // ignore errors, still remove client state
        } finally {
            removeToken()
            setAuth(null)
            navigate('/login')
        }
    }

    return(
        <AuthContext.Provider value={{auth, setAuth, login, loading, roleAccess, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
