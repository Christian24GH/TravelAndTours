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
                const response = await axios.get("/api/user")
                setAuth(response.data)
            } catch (error) {
                setAuth(null)
            }finally {
                setLoading(false);
            }
        }
        checkAuth()
    }, [])

    const login = async (data) => {
        await axios.get("/sanctum/csrf-cookie");
        try {
            await axios.get('/sanctum/csrf-cookie')

            const response = await axios.post('/api/login', data)

            if (response.status === 200) {
                const user = response.data?.user

                setAuth(user)

                if (user && user.id) {
                    localStorage.setItem('authUser', JSON.stringify(user));
                }
                if (user && user.role === 'Employee' && user.id) {
                    localStorage.setItem('employeeId', user.id);
                }

                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }

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
                navigate('/login');
                break;

            case 'LogisticsII Admin':
            case 'Driver':
                navigate('/logisticsII/');
                break;

            case 'HR2 Admin':
            case 'Employee':
                navigate('/hr2/db');
                break;

            case 'Guest':
                navigate('/main/maintenance');
                break;

            default:
                navigate('/login');
        }
    }

    const logout = () => {
        axios.post("/api/logout");
        localStorage.removeItem('authUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('employeeId');
        navigate('/login');
        setAuth(null);
    }

    return(
        <AuthContext.Provider value={{auth, setAuth, login, loading, roleAccess, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext