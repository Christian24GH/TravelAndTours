import { CalendarIcon } from "lucide-react"
import { Controller } from "react-hook-form"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import React from "react"

/** helper: produce ISO with local offset, e.g. 2025-09-03T21:23:00+08:00 */
function toLocalIsoWithOffset(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // timezone offset in minutes; convert to +HH:MM or -HH:MM
  const tzMin = -date.getTimezoneOffset(); // invert sign: Date.getTimezoneOffset returns minutes *behind* UTC
  const sign = tzMin >= 0 ? "+" : "-";
  const tzHours = pad(Math.floor(Math.abs(tzMin) / 60));
  const tzMinutes = pad(Math.abs(tzMin) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${tzHours}:${tzMinutes}`;
}

/** safe parser: accept ISO with Z or offset, or naive string (YYYY-MM-DDTHH:mm(:ss)?) */
function parseValueToDate(val) {
  if (!val) return null;
  // If value already contains Z or offset, parse with Date
  if (/[Z+\-]\d{2}(:?\d{2})?$/.test(val) || val.endsWith("Z")) {
    return new Date(val);
  }
  // If naive like "2025-09-10T11:43" or "2025-09-10T11:43:00" — treat as local
  // append seconds if missing
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) {
    return new Date(`${val}:00`);
  }
  return new Date(val);
}

export default function DateTimeField({ control, name, label, min, max, className, rules }) {
  return (
    <div className={cn("flex flex-col gap-2 mb-3", className)}>
      <Label htmlFor={name} className="font-normal text-secondary-foreground">{label}</Label>
      <Controller
        name={name}
        rules={rules}
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
                  // display: parse the stored value into a Date object safely and format
                  (() => {
                    const d = parseValueToDate(field.value);
                    return d && !isNaN(d) ? format(d, "PPP p") : "Pick a date & time";
                  })()
                ) : (
                  <span>Pick a date & time</span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value ? parseValueToDate(field.value) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  // keep time if already selected
                  const prev = field.value ? parseValueToDate(field.value) : new Date();
                  // make sure prev isn't invalid
                  const usePrev = prev && !isNaN(prev) ? prev : new Date();
                  date.setHours(usePrev.getHours(), usePrev.getMinutes(), usePrev.getSeconds() || 0, 0);
                  // store timezone-aware ISO (local offset)
                  field.onChange(toLocalIsoWithOffset(date));
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
                      ? (() => {
                          const d = parseValueToDate(field.value);
                          return d && !isNaN(d) ? `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : "00:00";
                        })()
                      : "00:00"
                  }
                  onChange={(e) => {
                    const date = field.value ? parseValueToDate(field.value) : new Date();
                    const valid = date && !isNaN(date);
                    const used = valid ? date : new Date();
                    const [hours, minutes] = e.target.value.split(":");
                    used.setHours(+hours, +minutes, used.getSeconds() || 0, 0);
                    field.onChange(toLocalIsoWithOffset(used));
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
