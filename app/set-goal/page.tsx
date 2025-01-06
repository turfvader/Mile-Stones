'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGoalSetting } from '../contexts/GoalSettingContext'

export default function SetGoal() {
  const router = useRouter()
  const { goal, setGoal, goalDate, setGoalDate, setCurrentStep } = useGoalSetting()

  useEffect(() => {
    setCurrentStep('set-goal')
  }, [setCurrentStep])

  const handleNext = () => {
    setCurrentStep('current-status')
    router.push('/current-status')
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">目標を設定する</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>目標入力</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="例: TOEICで800点取得、5kg減量"
                className="mb-4"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>達成期限の設定</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={goalDate ? new Date(goalDate) : undefined}
                onSelect={(date) => setGoalDate(date ? date.toISOString() : '')}
                className="rounded-md border"
                modifiers={{
                  selected: (day) => day.toDateString() === new Date(goalDate).toDateString(),
                }}
                modifiersStyles={{
                  selected: { backgroundColor: '#FF6F61', color: 'white' },
                }}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button onClick={() => router.push('/')} variant="outline">
              戻る
            </Button>
            <Button onClick={handleNext}>
              次へ（現在地確認）
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

