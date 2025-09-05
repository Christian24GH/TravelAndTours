import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertDescription } from '@/components/ui/alert'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from 'react-hook-form'
import AuthContext from "../context/AuthProvider"
import { useContext } from "react"


export function LoginForm({
  className,
  ...props
}) {

  const { register, handleSubmit, formState: {errors, isSubmitting} }  = useForm()
  const {login} = useContext(AuthContext)
  
  const formSubmit = async (data) => {
    await login(data)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="py-10 px-5">
        <CardHeader>
          <CardTitle className="text-center">Login to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(formSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor='email'>Email</Label>
                <Input {...register('email', {
                    required: 'Email is required'
                  })} id="email" type="email" placeholder="m@example.com"
                  disabled={isSubmitting}
                  />
                {errors.email && (
                  <AlertDescription className="text-red-500">{errors.email.message}</AlertDescription>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/*
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  */}
                </div>
                <Input {...register('password', {
                    required: 'Password is required'
                  })} id="password" type="password"
                  disabled={isSubmitting}
                  />
                {errors.password && (
                  <AlertDescription className="text-red-500">{errors.password.message}</AlertDescription>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={isSubmitting} type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
