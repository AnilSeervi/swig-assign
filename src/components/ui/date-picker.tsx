import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date, submit?: boolean) => void
  className?: string
  questionType?: 'date' | 'datetime'
  disabled?: boolean
  defaultOpen?: boolean
}

export function DatePicker({ date, setDate, className, questionType = 'date', disabled = false, defaultOpen = false }: DatePickerProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [selected, setSelected] = React.useState<Date | undefined>(date);
  const [hours, setHours] = React.useState(selected?.getHours() || new Date().getHours());
  const [minutes, setMinutes] = React.useState(selected?.getMinutes() || new Date().getMinutes());

  // Update local selection when prop changes
  React.useEffect(() => {
    setSelected(date);
    if (date) {
      setHours(date.getHours());
      setMinutes(date.getMinutes());
    }
  }, [date]);

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const numValue = parseInt(value, 10);
    if (type === 'hours' && numValue >= 0 && numValue < 24) {
      setHours(numValue);
    } else if (type === 'minutes' && numValue >= 0 && numValue < 60) {
      setMinutes(numValue);
    }
  };

  const getFinalDate = () => {
    if (!selected) return undefined;
    const finalDate = new Date(selected);
    if (questionType === 'datetime') {
      finalDate.setHours(hours);
      finalDate.setMinutes(minutes);
    }
    return finalDate;
  };

  const displayFormat = questionType === 'datetime' 
    ? `PPP 'at' HH:mm`
    : "PPP";

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(getFinalDate() || selected, displayFormat) : <span>Pick a date{questionType === 'datetime' ? ' and time' : ''}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={disabled ? undefined : (date) => setSelected(date)}
          initialFocus
          disabled={disabled}
        />
        {questionType === 'datetime' && selected && (
          <div className="flex items-center gap-2 p-3 border-t">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={hours.toString().padStart(2, '0')}
                onChange={(e) => handleTimeChange('hours', e.target.value)}
                className={cn(
                  "w-12 p-1 text-center rounded border",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
                min={0}
                max={23}
              />
              <span>:</span>
              <input
                type="number"
                value={minutes.toString().padStart(2, '0')}
                onChange={(e) => handleTimeChange('minutes', e.target.value)}
                className={cn(
                  "w-12 p-1 text-center rounded border",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
                min={0}
                max={59}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end p-3 border-t">
          <Button 
            size="sm"
            onClick={() => {
              const finalDate = getFinalDate();
              if (finalDate) {
                setDate(finalDate, true);
                setOpen(false);
              }
            }}
            disabled={!selected || disabled}
          >
            Proceed
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
