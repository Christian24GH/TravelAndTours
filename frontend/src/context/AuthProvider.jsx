import {createContext, useState, useEffect } from "react";
import axios from "../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";
const AuthContext = createContext({})

export const AuthProvider = ({children})=>{
    const [auth, setAuth] = useState({})
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Sanctum ensures session is tied to HttpOnly cookie
                const response = await axios.get("/api/user", { withCredentials: true })
                setAuth(response.data) // user object returned by Laravel
            } catch (error) {
                setAuth(null) // not logged in
            }finally {
                setLoading(false); // check complete
            }
        }
        checkAuth()
    }, [])

    const login = async (data) => {
        try {
            // Ensure CSRF cookie is set first
            await axios.get('/sanctum/csrf-cookie')
    
            // Attempt login
            const response = await axios.post('/api/login', data)
    
            if (response.status === 200) {
                const user = response.data?.user
    
                // Save user in your auth state/context
                setAuth(user)
    
                toast.success('Login successful, redirecting...', { position: "top-center" })

                roleAccess(user, navigate)
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
        }
    }
    
    const roleAccess = (user, navigate) => {
        switch (user.role) {
            case 'Super Admin':
                navigate('/');
                break;
            case 'LogisticsII Admin':
            case 'Driver':
            case 'Employee':
                navigate('/logisticsII/');
                break;
            case 'LogisticsI Admin':
                navigate('/logistics1/');
                break;
            case 'HR3 Manager':
                navigate('/hr3/');
                break;
            default:
                navigate('/login');
        }
    }

    const logout = () => {
        axios.post("/api/logout");
        navigate('/login') // back to login
        setAuth(null);
    }

    return(
        <AuthContext.Provider value={{auth, setAuth, login, loading, roleAccess, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext