'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Calendar } from "./ui/calendar"
import { WheelPicker } from "./WheelPicker"
import { X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: {
    title: string
    date: Date
    startTime: string
    endTime: string
    categoryColor: string
  }) => void
}

export function TaskCreationModal({ isOpen, onClose, onSave }: TaskCreationModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [categoryColor, setCategoryColor] = useState('#FF6F61')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const colors = [
    '#FF6F61', // ピンク
    '#4A90E2', // 青
    '#50E3C2', // ターコイズ
    '#F5A623', // オレンジ
    '#7ED321', // 緑
  ]

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!title.trim()) newErrors.title = 'タイトルを入力してください'
    if (!date) newErrors.date = '日付を選択してください'
    if (!startTime) newErrors.startTime = '開始時間を選択してください'
    if (!endTime) newErrors.endTime = '終了時間を選択してください'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSave({
      title,
      date,
      startTime,
      endTime,
      categoryColor
    })

    // 保存成功後、フォームをリセット
    setTitle('')
    setDate(new Date())
    setStartTime('09:00')
    setEndTime('10:00')
    setCategoryColor('#FF6F61')
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-[#FF6F61]">
            新しい予定
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
            <Label htmlFor="title">何をしますか？</Label>
            <Input
              id="title"
              placeholder="ランニングに行こう！"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>いつ？</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
              classNames={{
                day_selected: "bg-[#FF6F61] hover:bg-[#FF8075] focus:bg-[#FF8075]",
                day_today: "bg-accent text-accent-foreground",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  "hover:bg-[#FFE5E2] focus:bg-[#FFE5E2]",
                  "aria-selected:bg-[#FF6F61] aria-selected:text-white"
                ),
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label>何時から何時まで？</Label>
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
            <Label>カテゴリーの色</Label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full transition-all ${
                    categoryColor === color
                      ? 'ring-2 ring-offset-2 ring-[#FF6F61]'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCategoryColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <Button
            onClick={handleSave}
            className="w-full bg-[#FF6F61] hover:bg-[#FF8075] text-white"
          >
            予定を作成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

