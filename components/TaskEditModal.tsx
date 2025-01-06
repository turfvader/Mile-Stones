'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Calendar } from "./ui/calendar"
import { WheelPicker } from "./WheelPicker"
import { X } from 'lucide-react'
import { Task } from '../types/task'
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface TaskEditModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
}

export default function TaskEditModal({ task, isOpen, onClose, onSave }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title)
  const [startTime, setStartTime] = useState(new Date(task.startDate).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  }))
  const [endTime, setEndTime] = useState(new Date(task.endDate).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  }))
  const [isRepeating, setIsRepeating] = useState(task.frequency !== '単発')
  const [frequency, setFrequency] = useState(task.frequency)
  const [startDate, setStartDate] = useState<Date>(new Date(task.startDate))
  const [endDate, setEndDate] = useState<Date>(new Date(task.endDate))
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // 日付比較用のヘルパー関数を追加
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // 日付生成関数を修正
  const generateRecurringDates = (start: Date, end: Date, freq: string): Date[] => {
    const dates: Date[] = []
    const startTime = start.getHours() * 60 + start.getMinutes()
    const current = new Date(start)
    const endDate = new Date(end)

    while (current <= endDate) {
      const isValidDay = 
        freq === '毎日' ||
        (freq === '平日' && current.getDay() !== 0 && current.getDay() !== 6) ||
        (freq === '休日' && (current.getDay() === 0 || current.getDay() === 6)) ||
        (freq === '毎週' && current.getDay() === start.getDay())

      if (isValidDay) {
        const date = new Date(current)
        // 時刻情報を維持
        date.setHours(Math.floor(startTime / 60), startTime % 60)
        dates.push(date)
      }

      // 日付のみ進める（時刻は保持）
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  // 開始日が変更されたときの処理
  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return
    setStartDate(date)
    if (!endDate || date > endDate) {
      setEndDate(date)
    }
    toast({
      title: "終了日を選択してください",
      description: "開始日以降の日付を選択してください",
    })
  }

  // 日付が変更されたときにハイライトを更新
  useEffect(() => {
    if (!startDate || !endDate || !isRepeating) {
      setHighlightedDates([startDate])
      return
    }

    // 開始時刻を含めた日付を生成
    const [hours, minutes] = startTime.split(':').map(Number)
    const start = new Date(startDate)
    start.setHours(hours, minutes)
    
    const dates = generateRecurringDates(start, endDate, frequency)
    setHighlightedDates(dates)
  }, [startDate, endDate, frequency, isRepeating, startTime])

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!title.trim()) newErrors.title = 'タイトルを入力してください'
    if (!startTime) newErrors.startTime = '開始時間を選択してください'
    if (!endTime) newErrors.endTime = '終了時間を選択してください'
    if (isRepeating && !endDate) newErrors.endDate = '終了日を選択してください'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const updatedStartDate = new Date(startDate)
    updatedStartDate.setHours(startHour, startMinute)
    
    const updatedEndDate = new Date(endDate)
    updatedEndDate.setHours(endHour, endMinute)

    // リピート設定がある場合は、該当する日付をすべて生成
    const dates = isRepeating 
      ? generateRecurringDates(updatedStartDate, updatedEndDate, frequency)
      : [updatedStartDate]

    try {
      await onSave({
        ...task,
        title,
        startDate: updatedStartDate.toISOString(),
        endDate: updatedEndDate.toISOString(),
        frequency: isRepeating ? frequency : '単発',
        recurringDates: dates.map(d => d.toISOString())
      })

      toast({
        title: "予定を更新しました",
        description: `${title}の予定を保存しました`,
      })
    } catch (error) {
      console.error('Error saving task:', error)
      toast({
        title: "エラー",
        description: "予定の保存に失敗しました",
        variant: "destructive",
      })
    }
  }

  // JSXの構造は前回と同じですが、カレンダーの位置を移動し、
  // リピート設定の下に配置します。また、ハイライト表示用の
  // modifierDates propを追加します。
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-[#FF6F61]">
            予定を編集
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="title">タスク名</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>時間</Label>
            <div className="flex gap-4 justify-center">
              <WheelPicker
                label="開始"
                value={startTime}
                onChange={setStartTime}
                items={Array.from({ length: 24 * 4 }).map((_, i) => {
                  const hour = Math.floor(i / 4)
                  const minute = (i % 4) * 15
                  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                })}
              />
              <span className="self-center">～</span>
              <WheelPicker
                label="終了"
                value={endTime}
                onChange={setEndTime}
                items={Array.from({ length: 24 * 4 }).map((_, i) => {
                  const hour = Math.floor(i / 4)
                  const minute = (i % 4) * 15
                  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>リピートする？</Label>
            <div className="flex gap-2">
              <Button
                variant={isRepeating ? "default" : "outline"}
                onClick={() => setIsRepeating(true)}
                className={isRepeating ? "bg-[#FF6F61] hover:bg-[#FF8075]" : ""}
              >
                はい
              </Button>
              <Button
                variant={!isRepeating ? "default" : "outline"}
                onClick={() => setIsRepeating(false)}
                className={!isRepeating ? "bg-[#FF6F61] hover:bg-[#FF8075]" : ""}
              >
                いいえ
              </Button>
            </div>
            
            {isRepeating && (
              <>
                <div className="grid gap-2 mt-2">
                  <Label>頻度</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['毎日', '平日', '休日', '毎週'].map((f) => (
                      <Button
                        key={f}
                        variant={frequency === f ? "default" : "outline"}
                        onClick={() => setFrequency(f)}
                        className={cn(
                          "flex-1",
                          frequency === f ? "bg-[#FF6F61] hover:bg-[#FF8075]" : ""
                        )}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* カレンダー選択部分 */}
                <div className="grid gap-4 mt-4">
                  <div>
                    <Label className="text-sm text-gray-500 mb-1">開始日</Label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      modifiers={{ highlighted: highlightedDates }}
                      modifiersStyles={{
                        highlighted: { backgroundColor: '#FFE5E2', color: '#FF6F61', fontWeight: 'bold' }
                      }}
                      className="rounded-md border"
                      classNames={{
                        day_selected: "bg-[#FF6F61] hover:bg-[#FF8075] focus:bg-[#FF8075] text-white",
                        day_today: "bg-accent text-accent-foreground",
                        day: cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          "hover:bg-[#FFE5E2] focus:bg-[#FFE5E2]",
                          "aria-selected:bg-[#FF6F61] aria-selected:text-white"
                        ),
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500 mb-1">終了日</Label>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      disabled={(date) => date < startDate}
                      modifiers={{ highlighted: highlightedDates }}
                      modifiersStyles={{
                        highlighted: { backgroundColor: '#FFE5E2' }
                      }}
                      className="rounded-md border"
                      classNames={{
                        day_selected: "bg-[#FF6F61] hover:bg-[#FF8075] focus:bg-[#FF8075] text-white",
                        day_today: "bg-accent text-accent-foreground",
                        day: cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          "hover:bg-[#FFE5E2] focus:bg-[#FFE5E2]",
                          "aria-selected:bg-[#FF6F61] aria-selected:text-white"
                        ),
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <Button
            onClick={handleSave}
            className="w-full bg-[#FF6F61] hover:bg-[#FF8075] text-white"
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

