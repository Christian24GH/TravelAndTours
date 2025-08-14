import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


import { AlertDescription } from '@/components/ui/alert'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useForm, Controller } from 'react-hook-form'
import { YearCombobox } from "../ui/dropdown-year"
import axios from "axios"
import { api } from "../../api_routes"
import { useState } from "react"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"

export function UpdateDialog({item}){
    const { register,
            handleSubmit, 
            control,
            watch,
            formState: {errors, isSubmitting} } = useForm({
              id: item.id,
              vin: item.vin,
              plate_number: item.plate_number,
              make:item.make,
              model:item.model,
              year:item.year,
              capacity: item.capacity,
              acqdate: item.acquisition_date,
            })
    const [ open, setOpen ] = useState(false)

    const onSubmit = async (data) => {
      try{
        let response = await axios.put(api.update, data)
        
        if(response.status === 200){
          console.log(response)
          toast.success(response.data, {
            position: "top-center"
          })
          setOpen(false)
        }
      }
      catch(error){
        if(error.status === 422){
          console.log(error)
          toast.error(error.response.data.message, {
            position: "top-center"
          })
        }
        if(error.status === 500){
          toast.error("Server Error", {
            position: "top-center"
          })
        }
      }
    }

    return(
        <Dialog  open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setOpen(true)}>Edit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit vehicle {item.vin}</DialogTitle>
              <DialogDescription>
                Make changes to your vehice here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('id')} defaultValue={item.id} type="hidden" />
              <div className="grid gap-2 mb-3">
                <div className="grid gap-3 mb-3">
                  <div className="flex items-center justify-between">
                    <Label>VIN</Label>
                    {errors.vin && (<AlertDescription className={"text-red-500"}>{errors.vin.message}</AlertDescription>)}
                  </div>
                  <Input {...register('vin', {
                      required: "VIN is required"
                    })} defaultValue={item.vin} />
                </div>
                {/* Plate Number */}
                <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center justify-between">
                    <Label>Plate Number</Label>
                    {errors.plate_number && (
                        <AlertDescription className="text-red-500">{errors.plate_number.message}</AlertDescription>
                    )}
                    </div>
                    <Input
                      {...register("plate_number", {
                          required: "Plate number is required!",
                      })}
                      defaultValue={item.plate_number}
                      type="text"
                      className={errors.plate_number ? "border-red-500 focus-visible:ring-red-300" : ""}
                    />
                </div>

                <div className="flex gap-2 mb-3">
                    {/* Brand */}
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between">
                          <Label>Brand</Label>
                          {errors.make && (
                            <AlertDescription className="text-red-500">{errors.make.message}</AlertDescription>
                          )}
                        </div>
                        <Input
                            {...register("make", { required: "Brand is required!" })}
                            type="text"
                            defaultValue={item.make}
                            className={errors.make ? "border-red-500 focus-visible:ring-red-300" : ""}
                            />
                    </div>

                    {/* Model */}
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between">
                          <Label>Model</Label>
                          {errors.model && (
                            <AlertDescription className="text-red-500">{errors.model.message}</AlertDescription>
                          )}
                        </div>
                        <Input
                            {...register("model", { required: "Model is required!" })}
                            type="text"
                            defaultValue={item.model}
                            className={errors.model ? "border-red-500 focus-visible:ring-red-300" : ""}
                            />
                        
                    </div>
                </div>

                {/*Year*/}
                <div className="grid gap-3 mb-3">
                  <div className="flex items-center justify-between">
                    <Label>Year</Label>
                    {errors.year && (<AlertDescription className={"text-red-500"}>{errors.year.message}</AlertDescription>)}
                  </div>
                  <Controller 
                    name="year"
                    control={control}
                    rules={{ required: "Year is required!" }}
                    defaultValue={item.year}
                    render={({ field }) => (
                      <YearCombobox
                        startYear={1990}
                        value={field.value?.toString()}
                        onChange={(y) => field.onChange(String(y))}
                      />
                    )}
                  />
                </div>

                {/* Type */}
                <div className="flex gap-2 mb-3">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                      <Label>Type</Label>
                      {errors.type && (
                          <AlertDescription className="text-red-500">{errors.type.message}</AlertDescription>
                      )}
                    </div>
                    <Controller
                        control={control}
                        name="type"
                        defaultValue={item.type}
                        rules={{ required: "Type is required!" }}
                        render={({field})=>(
                            <Select value={field.value} onValueChange={(v)=>field.onChange(v)}>
                                <SelectTrigger className={errors.color ? "border-red-500 focus-visible:ring-red-300" : "" + "w-full"}>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sedan">Sedan</SelectItem>
                                    <SelectItem value="SUV">SUV</SelectItem>
                                    <SelectItem value="Truck">Truck</SelectItem>
                                    <SelectItem value="Van">Van</SelectItem>
                                    <SelectItem value="Etc.">Etc.</SelectItem>
                                </SelectContent>
                            </Select>
                        )}  
                    />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between">
                      <Label>Status</Label>
                        {errors.status && (
                            <AlertDescription className="text-red-500">{errors.status.message}</AlertDescription>
                        )}
                      </div>
                      <Controller
                          control={control}
                          name="status"
                          defaultValue={item.status}
                          rules={{ required: "Status is required!" }}
                          render={({field})=>(
                              <Select value={field.value} onValueChange={(v)=>field.onChange(v)}>
                                  <SelectTrigger className={errors.color ? "border-red-500 focus-visible:ring-red-300" : "" + "w-full"}>
                                      <SelectValue/>
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="under_maintenance">Maintenance</SelectItem>
                                      <SelectItem value="retired">Retired</SelectItem>
                                  </SelectContent>
                              </Select>
                          )}  
                      />
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex gap-2 mb-3">
                  <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between">
                        <Label>Capacity</Label>
                        {errors.capacity && (
                          <AlertDescription className="text-red-500">{errors.capacity.message}</AlertDescription>
                        )}
                      </div>
                      <Input
                        {...register('capacity', {
                            min: {
                            value: 1,
                            message: "Capacity must be a positive number",
                            },
                            maxLength: {
                            value: 4,
                            message: "Capacity cannot exceed 4 digits",
                            },
                            pattern: {
                            value: /^[0-9]+$/,
                            message: "Only positive numbers are allowed",
                            }
                        })}
                        defaultValue={item.capacity}
                        type="number"
                        min="1"
                        placeholder="Optional"
                        />
                  </div>
                  
                  {/* Acquisition Date */}
                  <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between">
                      <Label>Acquisition Date</Label>
                      {errors.acqdate && (
                          <AlertDescription className="text-red-500">{errors.acqdate.message}</AlertDescription>
                      )}
                      </div>
                      <Controller 
                          control={control} 
                          name="acqdate"
                          defaultValue={item.acquisition_date}
                          //rules={{ required: "Acquisition Date is required!" }}
                          render={({field})=>(
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button
                                      variant="outline"
                                      data-empty={!watch('acqdate')}
                                      className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                                      >
                                  <CalendarIcon />
                                  {watch('acqdate') ? format(watch('acqdate'), "PPP") : <span>{"Pick a Date(Optional)"}</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" captionLayout="dropdown" selected={field.value} onSelect={(d)=>field.onChange(d)}/>
                              </PopoverContent>
                          </Popover>
                          )}
                      />
                  </div>
                  
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit"
                  disabled={isSubmitting}
                  >{isSubmitting ? 'Saving' : 'Save Changes'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    )
}