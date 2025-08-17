import { useContext, useEffect } from "react"
import AuthContext from "../context/AuthProvider"
import { Outlet, useNavigate } from 'react-router'

export function GuestRoute(){
    const { auth, roleAccess } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (auth) {
            roleAccess(auth, navigate);
        }
    }, [auth, navigate]);

    return (
        <Outlet/>
    )
}