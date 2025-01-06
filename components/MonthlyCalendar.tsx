'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type MonthlyCalendarProps = {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onClose: () => void
}

export function MonthlyCalendar({ selectedDate, onDateSelect, onClose }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([])

  useEffect(() => {
    setCalendarDays(getCalendarDays(currentMonth))
  }, [currentMonth])

  const getCalendarDays = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i))
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  return (
    <div className="bg-white rounded-t-2xl p-4 shadow-lg max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleString('ja-JP', { year: 'numeric', month: 'long' })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`h-10 ${
              day?.toDateString() === selectedDate.toDateString() ? 'bg-red-100' : ''
            } ${isToday(day as Date) ? 'bg-pink-100 border border-pink-500' : ''}`}
            disabled={!day}
            onClick={() => {
              if (day) {
                onDateSelect(day)
                onClose()
              }
            }}
          >
            {day?.getDate()}
          </Button>
        ))}
      </div>
    </div>
  )
}

