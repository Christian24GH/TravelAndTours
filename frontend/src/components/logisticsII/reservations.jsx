import { ChevronsUpDownIcon, CheckIcon, EyeIcon, MapPin } from "lucide-react";
import { useEffect, useState, useLayoutEffect, useContext, useRef } from "react";
import AuthContext from '@/context/AuthProvider'
import { useForm, Controller } from "react-hook-form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {AlertDescription} from '@/components/ui/alert'
import { cn } from "@/lib/utils"
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

import axios from "axios";
import { logisticsII } from "@/api/logisticsII";
import DateTimeField from "@/components/logisticsII/data-picker"
const api = logisticsII.backend.api;

export function ViewDialog({item}){
  const [openViewDialog, setViewDialog] = useState(false)
  return(
    <Dialog open={openViewDialog} onOpenChange={setViewDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={()=>setViewDialog(true)}><EyeIcon/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Reservation Request 
          </DialogTitle>
          <DialogDescription>{item.status === 'Pending' ? 'Read carefully before accepting/rejecting request' : `This request was ${item.status.toLowerCase()}`}</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-1">
          <div className="flex">
            <p className="font-normal">Request UUID: <span className="font-light">{item.uuid}</span></p>
          </div>
          <div className="flex">
            <p className="font-normal">Requested By: <span className="font-light">{item.employee_id}</span></p>
          </div>
          <div className="flex">
            <p className="font-normal">Requested For: <span className="font-light">{item.type} ({item.capacity})</span></p>
          </div>
          <div className="flex">
            <p className="font-normal">For Date:&nbsp;
              <span className="font-light">
                {item.start_time}
                <span className="font-medium"> To </span>
                {item.end_time}
              </span>
            </p>
          </div>
          <div className="flex w-full text-wrap">
            <p className="font-normal">Pick Up Location: <span className="font-light overflow-y-auto break-all whitespace-pre-wrap">{item.pickup}</span></p>
          </div>
          <div className="flex w-full text-wrap">
            <p className="font-normal">Drop Off Location: <span className="font-light overflow-y-auto break-all whitespace-pre-wrap">{item.dropoff}</span></p>
          </div>
          <div className="w-full text-wrap">
            <p className="font-normal mb-1">Purpose</p>
            <div className="w-full max-h-40 overflow-y-auto break-all whitespace-pre-wrap rounded-md border p-2 text-sm">
              {item.purpose ?? 'Not specified'}
            </div>
          </div>
          
        </div>
        {item.status == "Pending" && (
          <DialogFooter>
            <RejectReservation id={item.id} onClose={()=>setViewDialog(false)}/>
            <ApproveReservation id={item.id} onClose={()=>setViewDialog(false)}/>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ApproveReservation({id, onClose}){
  const [dialogOpen, setDialogOpen] = useState(false);
  const {register, 
          control, 
          handleSubmit, 
          formState:{errors, isSubmitting}} = useForm()
  
  const [ open, setOpen ] = useState()
  const [drivers, setDrivers] = useState()

  useEffect(()=>{
    const getDrivers = async () => {
      let response = await axios.get(`${api.drivers}?q=Available`)

      if(response.status == 200){
        setDrivers(response.data?.drivers)
      }
    }

    getDrivers()
  },[])

  const formSubmit = async (data) => {
    
    if(data.driver){
      let response = await axios.put(api.approveReservation, data)

      if(response.status === 200){
        onClose()
        toast.success('Dispatch orders created', {position:'top-center'})
      }else{
        toast.error('Error, failed to create dispatch orders', {position:'top-center'})
      }
    }else{
      toast.error('Driver is needed!', {position:'top-center'})
    }
    
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setDialogOpen(true)}>Assign Drivers</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit(formSubmit)} className="flex flex-col gap-3">
            <input {...register('id')} type="hidden" defaultValue={id}/> {/**Reservation ID */}
            <DialogHeader>
              <DialogTitle>Assign Driver</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Controller
                  name="driver"
                  control={control}
                  rule={{required: "This field is required"}}
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
                            ? drivers.find((d) => d.id === field.value)?.name
                            : "Select Driver..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search Driver..." />
                          <CommandList>
                            <CommandEmpty>No Driver found.</CommandEmpty>
                            <CommandGroup>
                              {drivers?.map((d) => (
                                <CommandItem
                                  key={d.id}
                                  value={d.id}
                                  onSelect={() => {
                                    field.onChange(d.id);
                                    setOpen(false);
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === d.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {d.name} ( {d.status} )
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.driver && (
                  <AlertDescription variant="destructive" size="sm">{errors.driver}</AlertDescription>
                )}
              </div>
            </div>
          
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button disabled={isSubmitting} type="submit">Approve</Button>
            </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  )
}

export function RejectReservation({id, onClose}){
  const { handleSubmit,
          register,
          formState:{isSubmitting}} = useForm()

  const formSubmit = async (data) => {
    const response = await axios.put(api.cancelReservation, data)
    if(response.status === 200){
      onClose()
      toast.success('Reservation cancelled', {position:'top-center'})
    }else{
      toast.error('Request cancellation failed', {position:'top-center'})
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>Reject</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This action will reject the reservation request.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <form onSubmit={handleSubmit(formSubmit)} className="flex gap-2">
            <input {...register('id')} type="hidden" defaultValue={id}/>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting} variant={"destructive"}>Reject</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ReservationDialog(){
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Make Reservation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit(formSubmit)}>
        <DialogHeader className="mb-3">
          <DialogTitle>Vehicle Reservation</DialogTitle>
        </DialogHeader>
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
                    <Textarea {...field}/>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={isSubmitting} type="submit">Submit</Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
  
}