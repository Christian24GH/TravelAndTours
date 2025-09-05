import { Toaster } from "sonner"
import { LoginForm } from "../components/login-form"
import { Link } from "react-router";
import { Label } from '@/components/ui/label'
import { motion } from "motion/react";
import bg from '@/assets/ironpattern.png'
import logo from '@/assets/finallogo.avif'
export default function LoginPage(){
    return( 
        <>
        <title>JOLI - Login</title>
        <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 relative">
            <Toaster richColors />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 md:top-6 md:left-6 md:translate-x-0"
            >
                <Link to="/">
                <   img src={logo} className="w-32 md:w-56" alt="Logo" />
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mt-20 md:mt-0"
            >
                <LoginForm />
            </motion.div>

            <div
                className="absolute inset-0 -z-50 bg-repeat"
                style={{ backgroundImage: `url(${bg})` }}
            />

        </div>
        </>
    )
}