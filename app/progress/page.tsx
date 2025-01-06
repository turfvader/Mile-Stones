'use client'

import { useState } from 'react'
import MainLayout from '../components/MainLayout'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, Clock } from 'lucide-react'

type Task = {
  id: number
  title: string
  completed: boolean
  deadline: Date
}

export default function ProgressCheck() {
  const [progress, setProgress] = useState(50)
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: '食事記録を始める', completed: true, deadline: new Date(2023, 6, 7) },
    { id: 2, title: '1時間のウォーキングを週3回実施', completed: false, deadline: new Date(2023, 6, 14) },
    { id: 3, title: '体重を1kg減らす', completed: false, deadline: new Date(2023, 6, 21) },
  ])

  const handleAddReminder = () => {
    // TODO: Implement reminder functionality
    console.log('リマインダーを追加')
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">進捗確認</h1>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3kg減量中. 達成率50%</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-100">
                  進行中
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {progress}%
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">達成済みタスク</h3>
          <ul className="space-y-2">
            {tasks.filter(task => task.completed).map(task => (
              <li key={task.id} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>{task.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">未達成タスク</h3>
          <ul className="space-y-2">
            {tasks.filter(task => !task.completed).map(task => (
              <li key={task.id} className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span>{task.title}</span>
                <span className="ml-auto text-sm text-gray-500">
                  期限: {task.deadline.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={handleAddReminder} className="w-full">
          リマインダーを追加
        </Button>
        <p className="text-center mt-4 text-green-600 font-medium">
          今日も1歩前進！頑張り続けましょう！
        </p>
      </div>
    </MainLayout>
  )
}

