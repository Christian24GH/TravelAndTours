import { ChevronsUpDownIcon, CheckIcon, EyeIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";

import AuthContext from "../context/AuthProvider";
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
  AlertDialogAction,
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


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { toast } from "sonner";
import {motion} from 'motion/react'
import { Textarea } from "@/components/ui/textarea"
import axios from "axios";

import { useEchoPublic } from "@laravel/echo-react";
import { logisticsII } from "../api/logisticsII";
import PaginationComponent from "../components/logisticsII/pagination";
import TableComponent from "../components/logisticsII/table";
import DateTimeField from "../components/logisticsII/data-picker"

const api = logisticsII.backend.api;
const reverb = logisticsII.reverb;

reverb.config();

const header = [
  { title: "Request", accessor: "uuid", cellClassName: "font-medium h-1"},
  { title: "VIN", accessor: "vin", cellClassName: "h-1" },
  { title: "Employee", accessor: "employee_id", cellClassName: "h-1" },
  { title: "Created", accessor: "created_at", cellClassName: "h-1"},
  {
    title: "Actions",
    render: (item)=>(
      <ViewDialog item={item}/>
    )
  },
];

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
          <DialogDescription>Read carefully before accepting/rejecting request</DialogDescription>
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
          <div className="w-full text-wrap">
            <p className="font-normal mb-1">Purpose</p>
            <div className="w-full max-h-40 overflow-y-auto break-all whitespace-pre-wrap rounded-md border p-2 text-sm">
              {item.purpose}
            </div>
          </div>
        </div>
        <DialogFooter>
          <RejectReservation id={item.id} onClose={()=>setViewDialog(false)}/>
          <ApproveReservation id={item.id} onClose={()=>setViewDialog(false)}/>
        </DialogFooter>
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
                <Button variant="outline">Cancel</Button>
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
            <Button disabled={isSubmitting} variant={"destructive"}>Reject</Button>
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
          reset,
          control, 
          handleSubmit, 
          formState:{errors, isSubmitting}} = useForm()

  const [ vehicles, setVehicles ] = useState()
  const [ open, setOpen ] = useState()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0) // force midnight
  const minDateTime = tomorrow.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"

  useEffect(()=>{
    axios.get(`${api.vehiclesAll}`)
      .then(response=>{
        const v = response.data?.vehicles
        setVehicles(prev => v)
      })
      .catch()
  })

  const formSubmit = async (data) => {
      let response = await axios.post(api.makeReservations, data)
      
      if(response){
        console.log(response)
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
          <div className="flex flex-col gap-2 mb-3" >
              <div className="flex items-center justify-between">
              <Label>Vehicle</Label>
              {errors.vehicle && (
                  <AlertDescription className="text-red-500">{errors.vehicle.message}</AlertDescription>
              )}
              </div>
              <Controller
                name="vehicle_id"
                control={control}
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
          <div className="flex flex-col gap-2 mb-3" >
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
          <div className="flex gap-2 mb-3" >
            <DateTimeField control={control} className="flex-1 w-full" name="start_time" min={minDateTime} label="Start Time" />
            <DateTimeField control={control} className="flex-1 w-full" name="end_time"   min={watch("start_time")} label="End Time" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={isSubmitting} type="submit">Submit</Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
  
}

export default function Reservation() {
  const [record, setRecord] = useState();
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios
        .get(`${api.reservations}`, {
          params: {
            page,
            q: search || undefined,
          },
        })
        .then((response) => {
          let data = response.data.reservations;
          setRecord(data.data || []);
          setTotalPage(data.last_page);
        })

        .catch(() => {
          toast.error("Error fetching reservations", {
            position: "top-center",
          });
        });
    }, 300); // debounce API calls by 300ms

    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  useEchoPublic('reservationChannel', "ReservationUpdates", (e)=>{
    let r = e.record

    setRecord((prev)=>{
      const exist = prev.find(item => item.id === r.id)
      if(exist){
        return prev.map(item => item.id === r.id ? r : item)
      }

      return [...prev, v]
    })
  })

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 h-full">
        <div className="flex flex-col flex-2 h-full">
            <div className="flex-4/5">
                <div className="flex mb-3 gap-2">
                    <Input
                        placeholder="Search Reservations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                   <ReservationDialog/>
                </div>
                <div className="min-h-96">
                    <TableComponent
                        list={record}
                        recordName="reservations"
                        columns={header}
                        />
                </div>
            </div>
            <PaginationComponent className="flex-2/12"
                totalPage={totalPage}
                page={page}
                setPage={setPage}
            />
        </div>
    </motion.div>
  );
}
