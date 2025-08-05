import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { api_routes } from "@/routes"
import  nprogress  from '@/components/ui/nprogress.config'
import axios from "axios";
import { AlertCircleIcon } from 'lucide-react'

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"


export function LoginForm({
  className,
  ...props
}) {

  const [ formData, setFormData ] = useState({})
  const [ formErrors, setFormErrors ] = useState({})

  const handleInput = (name, value) => {
    setFormData((prev)=>({
      ...prev,
      [name]: value
    }))
  } 

  const handleSubmit = (e) => {
    e.preventDefault()

    nprogress.start()
    setFormErrors({})
    axios.post(api_routes.login, formData, {withCredentials:true})
      .then(response => {
        console.log(response)
      })
      .catch(error=>{
        const { Email, Password } = error?.response?.data?.errors ?? {}

        setFormErrors((prev)=>({
          ...prev,
          Email: Email ?? '',
          Password: Password ?? '',
          Unauthorized: error?.response?.data?.Unauthorized ?? '',
        }))
      })
      .finally(()=>{
        nprogress.done()
      })
    
  }
  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      { formErrors.Unauthorized && (
        <Alert variant='destructive' className={"py-1 border-red-700 bg-red-50 rounded-sm"}>
          <AlertCircleIcon />
          <AlertDescription>{formErrors.Unauthorized}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <div>
            <Input 
              value={formData.Email || ''}
              onChange={(e)=>handleInput(e.target.name, e.target.value)}
              id="email" type="email" name="Email"  placeholder="m@example.com" required />
            {formErrors.Email && (
              <Alert variant="destructive" className={"p-0 m-0 border-0 pt-1 -z-10"}>
                <AlertCircleIcon />
                <AlertDescription>{formErrors.Email}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <div>
            <Input 
              value={formData.Password || ''}
              onChange={(e)=>handleInput(e.target.name, e.target.value)}
              className={formErrors.Password && ('border-red-600')}
              id="password" type="password" name="Password" required />
            {formErrors.Password && (
              <Alert variant="destructive" className={"p-0 m-0 border-0 pt-1 -z-10"}>
                <AlertCircleIcon />
                <AlertDescription>{formErrors.Password}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
    </form>
  );
}
