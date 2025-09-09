import { ChevronsUpDownIcon, CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useState, useEffect, useContext, useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command";
import DateTimeField from '@/components/logisticsII/date-picker'
import { Separator } from "@/components/ui/separator"
import { logisticsII } from "@/api/logisticsII";
import AddressInput from '@/components/logisticsII/address-input'
import { Textarea } from '@/components/ui/textarea'
import { AlertDescription } from '@/components/ui/alert'
import AuthContext from '@/context/AuthProvider'
import axios from "axios";
import { cn } from '@/lib/utils'
import {Skeleton} from '@/components/ui/skeleton'

const api = logisticsII.backend.api;

export function SingleReservation(){
    const {auth} = useContext(AuthContext)
    const navigate = useNavigate()
    //console.log(auth)
    const {register, 
            watch,
            control, 
            handleSubmit, 
            setValue,
            formState:{errors, isSubmitting}} = useForm()

    const [ vehicles, setVehicles ] = useState()
    const [ open, setOpen ] = useState()
    const [ vLoad, setVLoad ] = useState(false)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // force midnight
    const minDateTime = tomorrow.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"

    useLayoutEffect(()=>{
    const fetchAvailableVehicles = async() => {
        setVLoad(true)
        let response = await axios.get(`${api.vehiclesAll}?q=Available`)
        if(response.status === 200){
            const v = response.data?.vehicles
            setVehicles(prev => v)
        }else{
            toast.error('Failed to fetch available vehicles', {position: "top-center"})
        }
        setVLoad(false)
    }
    fetchAvailableVehicles()
    }, [])

    const formSubmit = async (data) => {
        const payload = {
            ...data,
            vehicle_ids: [data.vehicle_ids],
        };

        console.log(payload)

        let response = await axios.post(api.makeReservations, payload)
        
        if(response.status === 200){
            toast.success('Reservation request submitted', {position: 'top-center'})

            if(auth.role === 'LogisticsII Admin'){
                navigate(`/logisticsII/reservation/${response.data.batch_number}`)
            }else{
                navigate('/logisticsII/success')
            }
        }else{
            toast.error('Reservation request failed', {position: 'top-center'})
        }
    }
    return(
        <div className='px-1'>
            <form  onSubmit={handleSubmit(formSubmit)}>
                <input type="hidden" {...register('requestor_uuid')} defaultValue={auth.uuid}/>
                <div className="grid gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm mb-1">Single Vehicle Reservation</Label>
                            {errors.vehicle_ids && (
                                <AlertDescription className="text-red-500">{errors.vehicle_ids.message}</AlertDescription>
                            )}
                        </div>
                        <Controller
                            name="vehicle_ids"
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
                                    ? `${vehicles.find((v) => v.id === field.value)?.type} (${vehicles.find((v) => v.id === field.value)?.capacity})`
                                    : "Select Vehicle..."}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search Vehicle..." />
                                    <CommandList>
                                    {vLoad ? (
                                        <Skeleton className="h-4 w-full"/>
                                    ): (
                                        <>
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
                                                    {v.type} {v.capacity ?? ''}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            )}
                        />
                    </div>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <Label className="font-medium">Date & Time</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 w-full">
                                <DateTimeField control={control} rules={{required: "Start Time"}} className="w-full" name="start_time" min={minDateTime} label="Start Time" />
                                {errors.start_time && (<AlertDescription className="text-red-500">{errors.start_time.message}</AlertDescription>)}
                            </div>
                            <div className="flex-1 w-full">
                                <DateTimeField control={control} rules={{required: "Start Time"}} className="w-full" name="end_time"   min={watch("start_time")} label="End Time" />
                                {errors.end_time && (<AlertDescription className="text-red-500">{errors.end_time.message}</AlertDescription>)}
                            </div>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <Label className="font-medium">Addresses</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 w-full">
                                <AddressInput
                                    name="pickup"
                                    label="Pick up location"
                                    setValue={setValue}
                                    register={register}
                                    errors={errors}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <AddressInput
                                    name="dropoff"
                                    label="Drop off location"
                                    setValue={setValue}
                                    register={register}
                                    errors={errors}
                                />
                            </div>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <Label className="font-medium">Purpose</Label>
                        <Controller
                            name="purpose"
                            control={control}
                            render = {({field}) => (
                                <Textarea className="break-all" {...field}/>
                            )
                        }/>
                    </div>
                </div>
                <Button disabled={isSubmitting} type="submit" className="w-full">Submit Reservation</Button>
            </form>
        </div>
    )
}

export function BatchReservation(){
    const {auth} = useContext(AuthContext)
    const navigate = useNavigate()
    const { control, handleSubmit, watch, register, formState:{errors, isSubmitting}, setValue } = useForm({
        defaultValues: {
            vehicle_ids: [
                { vehicle_id: '' }
            ], // start with one select
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "vehicle_ids",
    });
    
    //console.log(watch('vehicle_ids'))
    const selected = watch('vehicle_ids').filter(v => v.vehicle_id != '').map(v => v.vehicle_id)
    
    const [vehicles, setVehicles] = useState([]);
    const [open, setOpen] = useState(null); // track which popover is open

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // force midnight
    const minDateTime = tomorrow.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
    
    useEffect(() => {
        const fetchAvailableVehicles = async () => {
        try {
            const response = await axios.get(`${api.vehiclesAll}?q=Available`);
            if (response.status === 200) {
                setVehicles(response.data?.vehicles || []);
            }
        } catch (err) {
           toast.error("Failed to fetch available vehicles", {position: 'top-center'});
        }
        };
        fetchAvailableVehicles();
    }, []);

    const onSubmit = async (data) => {
        // data.reservations is an array of { vehicle_id }
        if(selected.length === 0) return

        const payload = {
            ...data,
            vehicle_ids: data.vehicle_ids.map((v) => v.vehicle_id), // extract IDs
        };
        
        //console.log(payload)
        
        try {
            const response = await axios.post(api.makeReservations, payload);
            if (response.status === 200) {
                toast.success("Batch reservation submitted!", {position: 'top-center'});

                if(auth.role === 'LogisticsII Admin'){
                    navigate(`/logisticsII/reservation/${response.data.batch_number}`)
                }else{
                    navigate('/logisticsII/success')
                }
            }
        } catch (err) {
            toast.error("Batch reservation failed", {position: 'top-center'});
        }
        
    };

    //console.log(selected.length)
    return(
        <div className='px-1'>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <input type="hidden" {...register('requestor_uuid')} defaultValue={auth.uuid}/>
                <div className="grid gap-4">
                    <div className="flex flex-col gap-4 flex-1">
                        <Label className="font-medium">Batch Vehicle Reservation</Label>
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center">
                                <Controller
                                    name={`vehicle_ids.${index}.vehicle_id`}
                                    control={control}
                                    rules={{ required: "Vehicle is required" }}
                                    render={({ field }) => (
                                    <Popover
                                        open={open === index}
                                        onOpenChange={(isOpen) => setOpen(isOpen ? index : null)}
                                    >
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="flex-1 justify-between"
                                        >
                                            {field.value
                                            ? `${vehicles.find((v) => v.id === field.value)?.type} (${vehicles.find((v) => v.id === field.value)?.capacity})`
                                            : "Select Vehicle..."}
                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search Vehicle..." />
                                                <CommandList>
                                                    <CommandEmpty>No Vehicle found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {vehicles.map((v) => (
                                                        <CommandItem
                                                            disabled={selected.includes(v.id)}
                                                            key={v.id}
                                                            value={v.id}
                                                            onSelect={() => {
                                                            field.onChange(v.id);
                                                            setOpen(null);
                                                            }}
                                                        >
                                                            <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === v.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                            />
                                                            {v.type} ({v.vin})
                                                        </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    )}
                                />

                                {fields.length > 1 && (
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                            
                        ))}

                        {selected.length === 0 && (<AlertDescription variant="destructive">Please select at least 1 vehicle</AlertDescription>)}
                        
                        
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => append({ vehicle_id: "" })}
                            className="flex items-center gap-1"
                        >
                            <PlusIcon className="h-4 w-4" /> Add Vehicle
                        </Button>
                    </div>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <Label className="font-medium">Date & Time</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 w-full">
                                <DateTimeField control={control} rules={{required: "Start Time"}} className="w-full" name="start_time" min={minDateTime} label="Start Time" />
                                {errors.start_time && (<AlertDescription className="text-red-500">{errors.start_time.message}</AlertDescription>)}
                            </div>
                            <div className="flex-1 w-full">
                                <DateTimeField control={control} rules={{required: "Start Time"}} className="w-full" name="end_time"   min={watch("start_time")} label="End Time" />
                                {errors.end_time && (<AlertDescription className="text-red-500">{errors.end_time.message}</AlertDescription>)}
                            </div>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <Label className="font-medium">Addresses</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 w-full">
                                <AddressInput
                                    name="pickup"
                                    label="Pick up location"
                                    setValue={setValue}
                                    register={register}
                                    errors={errors}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <AddressInput
                                    name="dropoff"
                                    label="Drop off location"
                                    setValue={setValue}
                                    register={register}
                                    errors={errors}
                                />
                            </div>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <Label className="font-medium">Purpose</Label>
                        <Controller
                            name="purpose"
                            control={control}
                            render = {({field}) => (
                                <Textarea className="break-all" {...field}/>
                            )
                        }/>
                    </div>
                </div>

                <Button disabled={isSubmitting} type="submit">Submit Batch Reservation</Button>
            </form>
        </div>
    )
}