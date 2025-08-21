import { CalendarIcon } from "lucide-react"
import { Controller } from "react-hook-form"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

export default function DateTimeField({ control, name, label, min, max, className }) {
  return (
    <div className={cn("flex flex-col gap-2 mb-3", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(new Date(field.value), "PPP p")
                ) : (
                  <span>Pick a date & time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  if (!date) return
                  // keep time if already selected
                  const prev = field.value ? new Date(field.value) : new Date()
                  date.setHours(prev.getHours(), prev.getMinutes())
                  field.onChange(date.toISOString())
                }}
                disabled={(date) =>
                  (min && date < new Date(min)) ||
                  (max && date > new Date(max))
                }
              />
              {/* Time Picker */}
              <div className="flex items-center justify-center p-3 border-t">
                <input
                  type="time"
                  className="border rounded px-2 py-1 text-sm"
                  value={
                    field.value
                      ? format(new Date(field.value), "HH:mm")
                      : "00:00"
                  }
                  onChange={(e) => {
                    const date = field.value ? new Date(field.value) : new Date()
                    const [hours, minutes] = e.target.value.split(":")
                    date.setHours(+hours, +minutes)
                    field.onChange(date.toISOString())
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  )
}
