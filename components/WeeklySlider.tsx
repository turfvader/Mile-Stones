'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface WeeklySliderProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  tasks: any[]
}

export function WeeklySlider({ selectedDate, onDateSelect, tasks }: WeeklySliderProps) {
  const [startDate, setStartDate] = useState(new Date())

  useEffect(() => {
    console.log('WeeklySlider dates:', {
      startDate,
      selectedDate,
      dates: Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
    });
  }, [startDate, selectedDate]);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const handlePrevWeek = () => setStartDate(subDays(startDate, 7))
  const handleNextWeek = () => setStartDate(addDays(startDate, 7))

  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1 grid grid-cols-7 gap-1">
        {dates.map((date) => (
          <Button
            key={date.toISOString()}
            variant={date.toDateString() === selectedDate.toDateString() ? "default" : "ghost"}
            className="flex flex-col items-center p-2"
            onClick={() => onDateSelect(date)}
          >
            <span className="text-xs">{format(date, 'E', { locale: ja })}</span>
            <span className="text-sm font-bold">{format(date, 'd')}</span>
          </Button>
        ))}
      </div>
      <Button variant="ghost" size="icon" onClick={handleNextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 