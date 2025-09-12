import { Toaster } from "sonner"
import { useState } from "react"
import { LoginForm } from "../components/login-form"
import { RegisterForm } from "../components/register-form"
import { Link } from "react-router";
import { Label } from '@/components/ui/label'
import { motion } from "motion/react";
import bg from '@/assets/ironpattern.png'
import logo from '@/assets/finallogo.avif'
export default function LoginPage(){
    const [showRegister, setShowRegister] = useState(false)

    const handleShowRegister = () => {
        setShowRegister(true)
    }

    const handleBackToLogin = () => {
        setShowRegister(false)
    }

    const handleRegisterSuccess = () => {
        setShowRegister(false)
    }

    return( 
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <Toaster richColors/>
            <div className="w-full max-w-sm">
                {showRegister ? (
                    <RegisterForm 
                        onBackToLogin={handleBackToLogin}
                        onSuccess={handleRegisterSuccess}
                    />
                ) : (
                    <LoginForm onShowRegister={handleShowRegister} />
                )}
            </div>
        </div>
    )
}