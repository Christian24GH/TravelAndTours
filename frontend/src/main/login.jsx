import { Toaster } from "sonner"
import { LoginForm } from "../components/login-form"
import { Helmet } from 'react-helmet';
import { Link } from "react-router";
export default function LoginPage(){
    return( 
        <>
        <Helmet>
            <title>JOLI - Login</title>
        </Helmet>
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
            <Toaster richColors/>
            <div className="absolute top-2 start-2">
                <Link to="/">
                    Joli Travel and Tours
                </Link>
            </div>
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
        </>
    )
}