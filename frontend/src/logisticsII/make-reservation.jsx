import { ChevronsUpDownIcon, CheckIcon, EyeIcon, MapPin } from "lucide-react";
import AuthContext from '@/context/AuthProvider'
import { useForm, Controller } from "react-hook-form";
import { cn } from "@/lib/utils"
import { AlertDescription } from '@/components/ui/alert'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import { Input } from '@/components/ui/input'
import {motion} from 'motion/react'

import axios from "axios";
import { logisticsII } from "@/api/logisticsII";
import DateTimeField from "@/components/logisticsII/data-picker"
const api = logisticsII.backend.api;

import { useEffect, useState, useContext, useLayoutEffect } from "react";
export default function MakeReservationPage(){
    const {auth} = useContext(AuthContext)
    const {register, 
            watch,
            control, 
            handleSubmit, 
            formState:{errors, isSubmitting}} = useForm()

    const [ vehicles, setVehicles ] = useState()

    const [ open, setOpen ] = useState()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // force midnight
    const minDateTime = tomorrow.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"

    useLayoutEffect(()=>{
    const fetchAvailableVehicles = async() => {
        let response = await axios.get(`${api.vehiclesAll}?q=Available`)
        if(response.status === 200){
            const v = response.data?.vehicles
            setVehicles(prev => v)
        }else{
            toast.error('Failed to fetch available vehicles', {position: "top-center"})
        }
    }
    fetchAvailableVehicles()
    }, [])

    const formSubmit = async (data) => {
        let response = await axios.post(api.makeReservations, data)
        
        if(response.status === 201){
            toast.success('Reservation request submitted', {position: 'top-center'})
        }else{
            toast.error('Reservation request failed', {position: 'top-center'})
        }
    }

    return(
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 h-full">
            <div className="flex flex-col items-center justify-center w-full">
                <form onSubmit={handleSubmit(formSubmit)} className="sm:max-w-[425px]">
                    <div className="grid gap-4">
                        <input type="hidden" {...register('employee_id')} defaultValue={auth.id}/>
                        <div className="flex flex-col gap-2" >
                            <div className="flex items-center justify-between">
                            <Label>Vehicle</Label>
                            {errors.vehicle_id && (
                                <AlertDescription className="text-red-500">{errors.vehicle_id.message}</AlertDescription>
                            )}
                            </div>
                            <Controller
                                name="vehicle_id"
                                control={control}
                                rules={{required:"Vehicle is required"}}
                                render={({ field }) => (
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {field.value
                                        ? vehicles.find((v) => v.id === field.value)?.vin
                                        : "Select Vehicle..."}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Vehicle..." />
                                        <CommandList>
                                        <CommandEmpty>No Vehicle found.</CommandEmpty>
                                        <CommandGroup>
                                            {vehicles?.map((v) => (
                                            <CommandItem
                                                key={v.id}
                                                value={v.id}
                                                onSelect={() => {
                                                field.onChange(v.id);
                                                setOpen(false);
                                                }}
                                            >
                                                <CheckIcon
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value === v.id ? "opacity-100" : "opacity-0"
                                                )}
                                                />
                                                {v.vin} {v.capacity ?? ''}
                                            </CommandItem>
                                            ))}
                                        </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2" >
                            <div className="flex items-center justify-between">
                            <Label>Purpose</Label>
                            </div>
                            <Controller
                                name="purpose"
                                control={control}
                                render = {({field}) => (
                                    <Textarea className={'max-w-[400px]'} {...field}/>
                                )
                                }/>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 w-full">
                            <DateTimeField control={control} rules={{required: "Start Time"}} className="w-full" name="start_time" min={minDateTime} label="Start Time" />
                            {errors.start_time && (<AlertDescription className="text-red-500">{errors.start_time.message}</AlertDescription>)}
                            </div>
                            <div className="flex-1  w-full">
                            <DateTimeField control={control} rules={{required: "Start Time"}} className="w-full" name="end_time"   min={watch("start_time")} label="End Time" />
                            {errors.end_time && (<AlertDescription className="text-red-500">{errors.end_time.message}</AlertDescription>)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                            <div className="flex items-center justify-between">
                                <Label>Location</Label>
                            </div>
                            <div>
                                <Input 
                                {...register('pickup', {
                                    required:"Pick up address is required!", 
                                    minLength:{value: 11, 
                                    message:"Minimum of 11 Characters"}})} 
                                placeholder="Pick up location"
                                />
                                {errors.pickup && (<AlertDescription className="text-red-500">{errors.pickup.message}</AlertDescription>)}
                            </div>
                            <div>
                                <Input {...register('dropoff', {
                                    required:"Drop off address is required!",
                                    minLength:{value: 11, 
                                    message:"Minimum of 11 Characters"}})} 
                                placeholder="Drop off location"
                                />
                                {errors.dropoff && (<AlertDescription className="text-red-500">{errors.dropoff.message}</AlertDescription>)}
                            </div>
                        </div>
                    </div>
                
                    <Button disabled={isSubmitting} type="submit">Submit</Button>
                </form>
            </div>
        </motion.div>
    )
}