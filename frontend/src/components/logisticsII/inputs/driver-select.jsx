import { useState, useEffect } from "react"
import axios from "axios"
import { logisticsII } from "@/api/logisticsII";
const api = logisticsII.backend.api;

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty, CommandInput } from "@/components/ui/command"
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function DriverSelect({ onSelect, assignments, defaultValue }) {
  const [open, setOpen] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let polling

    const getDrivers = async () => {
      try {
        const response = await axios.get(`${api.dialogDrivers}?q=Available`)
        if (response.status === 200) {
          //console.log(response)
          setDrivers(response.data?.drivers || [])
        }
      } catch (error) {
        console.error("Failed to fetch drivers", error)
      }
    }
    polling = setInterval(getDrivers, 5000)

    return () => clearInterval(polling)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
            <span className="truncate">
                {defaultValue ? defaultValue 
                : selected
                    ? drivers.find((d) => d.id === selected)?.name
                    : "Select Driver..."}
            </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 max-h-[30vh]">
        <Command>
          <CommandInput placeholder="Search driver..." />
          <CommandList>
            <CommandEmpty>No driver found.</CommandEmpty>
            <CommandGroup>
              {drivers.map((d) => (
                <CommandItem
                  key={d.id}
                  value={d.id}
                  disabled={assignments?.some(a => a.driver_uuid === d.uuid) || defaultValue}
                  onSelect={() => {
                    setSelected(d.id)
                    setOpen(false)
                    onSelect?.(d) // callback with selected driver object
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected === d.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {d.name} ({d.status})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
