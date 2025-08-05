import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api_routes } from '../routes'
import axios from "axios"
import  nprogress  from '@/components/ui/nprogress.config'
import { AlertCircleIcon } from 'lucide-react'

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

const roles = [
  {
    key:    'superadmin',
    text:  'Super Admin'
  },
  {
    key:    'admin',
    text:  'Admin'
  },
  {
    key:    'logisticsII',
    text:  'Logistics II'
  },
];
export function RegisterForm({
  className,
  ...props
}) {

  const [ formData, setFormData ] = useState({})
  const [ formErrors, setFormErrors ] = useState({})
  const [ formSuccess, setFormSuccess ] = useState(false)

  const handleInput = (name, value) => {
    setFormData((prev)=>({
      ...prev,
      [name]: value
    }))
  } 

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormErrors({})
    setFormSuccess(false)
    nprogress.start()
    axios.post(api_routes.register, formData, {withCredentials:true})
    .then(response=>{
      if(response.status === 201){
        setFormSuccess(true);
      }
    })
    .catch(errors=>{
      const error = errors?.response?.data?.errors;
      setFormErrors((prev) => ({
        ...prev,
        Email: error.Email ?? undefined,
        Password: error.Password ?? undefined,
        Name: error.Name ?? undefined,
        Role: error.Role ?? undefined,
      }));
    })
    .finally(()=>{
      nprogress.done()
    })
  }

  return (
    <form onSubmit={handleSubmit}className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register a new account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter new credentials to the field below to create a new account.
        </p>
      </div>
      {formSuccess && (
        <Alert className={"py-1 border-green-400 bg-green-50 text-green-700 rounded-sm"}>
          <AlertCircleIcon />
          <AlertDescription className={"text-green-700"}>Account created!</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <div>
            <Input 
              value={formData.Email || ''} 
              onChange={(e)=>handleInput(e.target.name, e.target.value)}
              id="email" type="email" name="Email" placeholder="m@example.com" required />

            {formErrors.Email && (
                <Alert variant="destructive" className={"p-0 m-0 border-0 pt-1 -z-10"}>
                  <AlertCircleIcon />
                  <AlertDescription>{formErrors.Email}</AlertDescription>
                </Alert>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          
          <div>
            <Input 
              value={formData.Name || ''} 
              onChange={(e)=>{handleInput(e.target.name, e.target.value)}}
              id="name" type="test" name="Name" placeholder="" required />
            {formErrors.Name && (
                <Alert variant="destructive" className={"p-0 m-0 border-0 pt-1 -z-10"}>
                  <AlertCircleIcon />
                  <AlertDescription>{formErrors.Name}</AlertDescription>
                </Alert>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <div> 
            <Select onValueChange={(value)=>handleInput('Role', value)} value={formData.Role}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roles.map(item=>(
                    <SelectItem key={item.key} value={item.key}>{item.text}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formErrors.Role && (
                <Alert variant="destructive" className={"p-0 m-0 border-0 pt-1 -z-10"}>
                  <AlertCircleIcon />
                  <AlertDescription>{formErrors.Role}</AlertDescription>
                </Alert>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <div>
            <Input 
              value={formData.Password || ''} 
              onChange={(e)=>handleInput(e.target.name, e.target.value)}
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
          Register
        </Button>
      </div>
    </form>
  );
}
