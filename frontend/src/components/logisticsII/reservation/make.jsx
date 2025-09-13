import {
  ChevronsUpDownIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useState, useEffect, useContext, useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import DateTimeField from "@/components/logisticsII/date-picker";
import { logisticsII } from "@/api/logisticsII";
import AddressInput from "@/components/logisticsII/inputs/address-input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDescription } from "@/components/ui/alert";
import AuthContext from "@/context/AuthProvider";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const api = logisticsII.backend.api;

export function BatchReservation() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      vehicle_ids: [{ vehicle_id: "" }],
      trip_plan: [],
    },
  });

  // dynamic fields
  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control,
    name: "vehicle_ids",
  });
  const {
    fields: tripFields,
    append: appendTrip,
    remove: removeTrip,
  } = useFieldArray({
    control,
    name: "trip_plan",
  });

  const selected = watch("vehicle_ids")
    .filter((v) => v.vehicle_id)
    .map((v) => v.vehicle_id);
  const tripPlan = watch("trip_plan");

  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const fetchAvailableVehicles = async () => {
      try {
        const response = await axios.get(`${api.vehiclesAll}?q=Available`);
        if (response.status === 200) setVehicles(response.data?.vehicles || []);
      } catch {
        toast.error("Failed to fetch available vehicles", {
          position: "top-center",
        });
      }
    };
    fetchAvailableVehicles();
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // force midnight
  const minDateTime = tomorrow.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"

  const onSubmit = async (data) => {
    console.log(tripPlan);
    // validation
    if (selected.length === 0) {
      toast.error("Please select at least 1 vehicle", {
        position: "top-center",
      });
      return;
    }
    if (
      tripPlan.length < 2 ||
      tripPlan.some((t) => !t.latitude || !t.longitude)
    ) {
      toast.error("Please provide at least 2 valid locations", {
        position: "top-center",
      });
      return;
    }

    const payload = {
      ...data,
      requestor_uuid: auth.uuid,
      vehicle_ids: data.vehicle_ids.map((v) => v.vehicle_id),
      trip_plan: data.trip_plan.map((t, i) => ({
        sequence: i + 1,
        address_name: t.address_name,
        latitude: t.latitude,
        longitude: t.longitude,
      })),
    };

    console.log(payload)
    try {
      const response = await axios.post(api.makeReservations, payload);
      if (response.status === 200) {
        toast.success("Reservation submitted!", { position: "top-center" });
        if (auth.role === "LogisticsII Admin") {
          navigate(`/logisticsII/reservation/${response.data.batch_number}`);
        } else {
          navigate("/logisticsII/success");
        }
      }
    } catch(e) {
        console.log(e)
        toast.error("Reservation failed", { position: "top-center" });
    }
  };

  return (
    <div className="px-1">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="hidden"
          {...register("requestor_uuid")}
          defaultValue={auth.uuid}
        />
        {/* Vehicles */}
        <div className="flex flex-col gap-4">
          <Label className="font-medium">Vehicles</Label>
          {vehicleFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
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
                          ? `${
                              vehicles.find((v) => v.id === field.value)?.type
                            } (${
                              vehicles.find((v) => v.id === field.value)
                                ?.capacity
                            })`
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
                                    field.value === v.id
                                      ? "opacity-100"
                                      : "opacity-0"
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
              {vehicleFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVehicle(index)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => appendVehicle({ vehicle_id: "" })}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Vehicle
          </Button>
        </div>

        {/**Date time */}
        <div className="flex flex-col gap-2">

          <Label className="font-medium">Date & Time</Label>
          <div className="flex gap-2">
            <div className="flex-1 w-full">
              <DateTimeField
                control={control}
                rules={{ required: "Start Time" }}
                className="w-full"
                name="start_dt"
                min={minDateTime}
                label="Start Time"
              />
              {errors.start_dt && (
                <AlertDescription className="text-red-500">
                  {errors.start_dt.message}
                </AlertDescription>
              )}
            </div>
            <div className="flex-1 w-full">

              <DateTimeField
                control={control}
                rules={{ required: "Start Time" }}
                className="w-full"
                name="end_dt"
                min={watch("start_dt")}
                label="End Time"
              />
              {errors.end_dt && (
                <AlertDescription className="text-red-500">
                  {errors.end_dt.message}
                </AlertDescription>
              )}
            </div>
          </div>
        </div>
        {/* Trip Plan */}
        <div className="flex flex-col gap-4 w-full">
          <Label className="font-medium">Trip Plan (Locations)</Label>
          {tripFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 w-full">
              <AddressInput
                className={"w-full flex-1"}
                name={`trip_plan.${index}`}
                label={`Location ${index + 1}`}
                setValue={setValue}
                register={register}
                errors={errors}
              />
              {tripFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTrip(index)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              appendTrip({ address_name: "", latitude: "", longitude: "" })
            }
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Location
          </Button>
        </div>
        {/* Purpose */}
        <div>
          <Label className="font-medium">Purpose</Label>
          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <Textarea className="break-all" {...field} />
            )}
          />
        </div>
        <Button disabled={isSubmitting} type="submit">
          Submit Reservation
        </Button>
      </form>
    </div>
  );
}
