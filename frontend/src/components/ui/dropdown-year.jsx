// components/year-combobox.tsx

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"

export function YearCombobox({
  value,
  onChange,
  startYear,
  endYear,
  descending = true,
  placeholder = "Select year",
  className,
  defaultValue,
}) {

  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const from = startYear ?? 1800;
  const to = endYear ?? currentYear;

  const years = useMemo(() => {
    const arr = [];
    for (let y = from; y <= to; y++) arr.push(y);
    return descending ? arr.reverse() : arr;
  }, [from, to, descending]);

  const label = value ?? defaultValue ?? placeholder;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(className, "w-full justify-between")}
        >
          {label}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" onWheel={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Search year..."/>
          <CommandList className="max-h-[200px] overflow-y-scroll">
            <CommandEmpty>No year found.</CommandEmpty>
            <CommandGroup>
                {years.map((y) => {
                  return (
                    <CommandItem
                        key={y}
                        value={y.toString()}
                        onSelect={() => {
                            onChange?.(y)
                            setOpen(false);
                        }}>
                    <Check className={cn("mr-2 h-4 w-4", value === y ? "opacity-100" : "opacity-0")} />
                    {y}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
