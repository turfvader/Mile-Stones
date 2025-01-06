'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Plus } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { TaskList } from '@/components/TaskList'
import { TaskCreationModal } from '@/components/TaskCreationModal'
import { db } from '../lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Task } from '@/types/task'

export default function Schedule() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  useEffect(() => {
    const tasksRef = collection(db, 'tasks')
    const q = query(tasksRef, where('addedToCalendar', '==', true))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTasks: Task[] = []
      querySnapshot.forEach((doc) => {
        const taskData = doc.data()
        fetchedTasks.push({
          id: doc.id,
          title: taskData.title,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
          frequency: taskData.frequency,
          completed: false,
          addedToCalendar: true,
          categoryColor: taskData.categoryColor
        })
      })
      setTasks(fetchedTasks)
    })

    return () => unsubscribe()
  }, [])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleAddTask = (taskData: { 
    title: string; 
    date: Date; 
    startTime: string; 
    endTime: string; 
    categoryColor: string; 
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      startDate: taskData.date.toISOString(),
      endDate: taskData.date.toISOString(),
      frequency: '単発',
      completed: false,
      addedToCalendar: true,
      categoryColor: taskData.categoryColor
    }
    setTasks(prev => [...prev, newTask])
    toast({
      title: "タスクを追加しました",
      description: "新しいタスクがカレンダーに追加されました。",
    })
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
  }

  const handleTaskDelete = async (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const tasksForSelectedDate = tasks.filter(task => {
    const taskStartDate = new Date(task.startDate)
    const taskEndDate = new Date(task.endDate)
    return selectedDate >= taskStartDate && selectedDate <= taskEndDate
  })

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-16 px-4">
        <h1 className="text-2xl font-bold mb-6">スケジュール</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}のタスク
            </h2>
            <TaskList
              tasks={tasksForSelectedDate}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          </div>
        </div>
        <Button
          className="fixed bottom-20 right-4 rounded-full shadow-lg bg-[#FF6F61] hover:bg-[#FF8075] text-white"
          onClick={() => setIsTaskModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          タスクを追加
        </Button>
      </div>
      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
      />
    </MainLayout>
  )
}

