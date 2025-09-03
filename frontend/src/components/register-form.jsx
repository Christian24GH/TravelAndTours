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
import { useState } from "react"
import { toast } from "sonner"
import axios from "../api/axios"

export function RegisterForm({
  className,
  onSuccess,
  onBackToLogin,
  ...props
}) {

  const { register, handleSubmit, formState: {errors, isSubmitting}, watch, reset }  = useForm()
  const [isLoading, setIsLoading] = useState(false)
  
  const password = watch("password")
  
  const formSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Get CSRF cookie first
      await axios.get('/sanctum/csrf-cookie')
      
      // Register user
      const response = await axios.post('/api/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: 'Guest'
      })

      if (response.status === 201 || response.status === 200) {
        toast.success('Registration successful! You can now login.', { 
          position: "top-center",
          duration: 4000 
        })
        reset()
        onSuccess && onSuccess()
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          // Validation errors
          const errors = error.response.data.errors
          if (errors) {
            Object.keys(errors).forEach(field => {
              errors[field].forEach(message => {
                toast.error(message, { position: "top-center" })
              })
            })
          } else {
            toast.error('Registration failed. Please check your input.', { position: "top-center" })
          }
        } else if (error.response.status === 409) {
          toast.error('Email already exists. Please use a different email.', { position: "top-center" })
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.', { position: "top-center" })
        } else {
          toast.error(`Registration failed (${error.response.status})`, { position: "top-center" })
        }
      } else {
        toast.error('Network error. Please check your connection.', { position: "top-center" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your information below to create your Guest account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(formSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor='name'>Full Name</Label>
                <Input 
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })} 
                  id="name" 
                  type="text" 
                  placeholder="Juan Dela Cruz"
                  disabled={isLoading}
                />
                {errors.name && (
                  <AlertDescription className="text-red-500">{errors.name.message}</AlertDescription>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor='email'>Email</Label>
                <Input 
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })} 
                  id="email" 
                  type="email" 
                  placeholder="juan.delacruz@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <AlertDescription className="text-red-500">{errors.email.message}</AlertDescription>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="password">Password</Label>
                <Input 
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })} 
                  id="password" 
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <AlertDescription className="text-red-500">{errors.password.message}</AlertDescription>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input 
                  {...register('password_confirmation', {
                    required: 'Password confirmation is required',
                    validate: value => 
                      value === password || 'The passwords do not match'
                  })} 
                  id="password_confirmation" 
                  type="password"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.password_confirmation && (
                  <AlertDescription className="text-red-500">{errors.password_confirmation.message}</AlertDescription>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button disabled={isSubmitting || isLoading} type="submit" className="w-full">
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={onBackToLogin}
                className="underline underline-offset-4 hover:text-primary"
                disabled={isLoading}
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
