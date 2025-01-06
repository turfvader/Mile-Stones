'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, ChevronRight, ChevronDown, Plus, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"

type Task = {
  id: number
  title: string
  date: string
  added: boolean
}

type Milestone = {
  id: number
  title: string
  deadline: string
  tasks: Task[]
}

export default function ConfirmMilestones() {
  const router = useRouter()
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1,
      title: '1週間で食事管理の基礎を整える',
      deadline: '2025-01-07',
      tasks: [
        { id: 1, title: '1日3回の食事記録をアプリに入力する', date: '2025-01-01', added: false },
        { id: 2, title: '1日1食ヘルシーレシピを試す', date: '2025-01-03', added: false },
        { id: 3, title: '1週間後に食事記録を振り返る', date: '2025-01-07', added: false },
      ]
    },
    {
      id: 2,
      title: 'ウォーキングを週3回習慣化する',
      deadline: '2025-01-14',
      tasks: [
        { id: 4, title: 'ウォーキングコースを決める', date: '2025-01-08', added: false },
        { id: 5, title: '週3回30分のウォーキングを実施', date: '2025-01-10', added: false },
        { id: 6, title: 'ウォーキング記録を確認', date: '2025-01-14', added: false },
      ]
    },
    {
      id: 3,
      title: '1kg減量を達成する',
      deadline: '2025-01-21',
      tasks: [
        { id: 7, title: '毎日の体重測定を開始', date: '2025-01-15', added: false },
        { id: 8, title: '食事と運動の記録を継続', date: '2025-01-18', added: false },
        { id: 9, title: '1kg減量達成を確認', date: '2025-01-21', added: false },
      ]
    },
  ])
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveTask = () => {
    if (editingTask) {
      setMilestones(milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => 
          task.id === editingTask.id ? editingTask : task
        )
      })))
      setEditingTask(null)
      toast({
        title: "タスクを更新しました",
        description: "タスクの内容が正常に更新されました。",
      })
    }
  }

  const handleAddToCalendar = (milestoneId: number, taskId: number) => {
    setMilestones(milestones.map(milestone => 
      milestone.id === milestoneId ? {
        ...milestone,
        tasks: milestone.tasks.map(task => 
          task.id === taskId ? { ...task, added: true } : task
        )
      } : milestone
    ))
    toast({
      title: "カレンダーに追加しました",
      description: "タスクがカレンダーに正常に追加されました。",
    })
  }

  const handleApprove = () => {
    // TODO: Save milestones and navigate to schedule screen
    router.push('/schedule')
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-16">
        <h1 className="text-2xl font-bold mb-6">マイルストーンを確認</h1>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3ヶ月で体重を5kg減らすための計画</h2>
          <p className="text-gray-600 mb-4">目標達成日: 2025年3月31日</p>
          <Accordion type="single" collapsible className="w-full">
            {milestones.map((milestone) => (
              <AccordionItem key={milestone.id} value={`milestone-${milestone.id}`}>
                <AccordionTrigger className="text-left">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-gray-600">締切: {milestone.deadline}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 mt-2">
                    {milestone.tasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">提案日: {task.date}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>タスクを編集</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <Input
                                  value={editingTask?.title || ''}
                                  onChange={(e) => setEditingTask(prev => prev ? {...prev, title: e.target.value} : null)}
                                  placeholder="タスク内容"
                                />
                                <Input
                                  type="date"
                                  value={editingTask?.date || ''}
                                  onChange={(e) => setEditingTask(prev => prev ? {...prev, date: e.target.value} : null)}
                                />
                              </div>
                              <DialogClose asChild>
                                <Button onClick={handleSaveTask}>保存</Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant={task.added ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleAddToCalendar(milestone.id, task.id)}
                            disabled={task.added}
                          >
                            {task.added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="flex justify-between">
          <Button onClick={() => router.back()} variant="outline">
            戻る
          </Button>
          <Button onClick={handleApprove}>
            承認してスケジュール画面へ
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}

