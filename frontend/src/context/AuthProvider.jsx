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
        await axios.get("/sanctum/csrf-cookie"); // get CSRF cookie
        try {
            // Ensure CSRF cookie is set first
            await axios.get('/sanctum/csrf-cookie')

            // Attempt login
            const response = await axios.post('/api/login', data)

            if (response.status === 200) {
                const user = response.data?.user

                // Save user in your auth state/context
                setAuth(user)

                // Store user in localStorage for all roles
                if (user && user.id) {
                    localStorage.setItem('authUser', JSON.stringify(user));
                }
                // Store employeeId in localStorage for Employee role
                if (user && user.role === 'Employee' && user.id) {
                    localStorage.setItem('employeeId', user.id);
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
                // Navigate to HR2 Admin dashboard, where links to /hr2a, /hr2m, /hr2e are available
                navigate('/hr2a');
                break;
            case 'Employee':
                // Navigate to HR2 Employee main page, UI should show links to /hr2m and /hr2e as needed
                navigate('/hr2m');
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