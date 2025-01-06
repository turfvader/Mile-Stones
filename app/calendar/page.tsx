'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../../components/MainLayout'
import { WeeklySlider } from '../../components/WeeklySlider'
import { TaskList } from '../../components/TaskList'
import { Button } from '../../components/ui/button'
import { Plus, Settings } from 'lucide-react'
import { db } from '../lib/firebase'
import { collection, query, onSnapshot, where, orderBy, deleteDoc, doc, addDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'
import { toast } from "../../components/ui/use-toast"
import { TaskCreationModal } from '../../components/TaskCreationModal'
import { Task } from '../../types/task'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const router = useRouter()
  const [isCreatingTask, setIsCreatingTask] = useState(false)

  useEffect(() => {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('addedToCalendar', '==', true),
      orderBy('startDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Raw Firestore data:', data);
        
        try {
          const parseFirestoreDate = (date: any) => {
            if (!date) return new Date();
            if (date instanceof Timestamp) return date.toDate();
            if (date.seconds) return new Date(date.seconds * 1000);
            return new Date(date);
          };

          const task: Task = {
            id: doc.id,
            title: data.title,
            startDate: parseFirestoreDate(data.startDate).toISOString(),
            endDate: parseFirestoreDate(data.endDate).toISOString(),
            frequency: data.frequency || '単発',
            completed: data.completed || false,
            addedToCalendar: data.addedToCalendar || true,
            categoryColor: data.categoryColor,
            recurringDates: data.recurringDates || []
          };
          console.log('Converted task:', task);
          fetchedTasks.push(task);
        } catch (error) {
          console.error('Error converting task data:', error, data);
        }
      });
      
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const taskRef = doc(db, 'tasks', updatedTask.id)
      
      const taskData = {
        title: updatedTask.title,
        startDate: Timestamp.fromDate(new Date(updatedTask.startDate)),
        endDate: Timestamp.fromDate(new Date(updatedTask.endDate)),
        frequency: updatedTask.frequency,
        completed: updatedTask.completed,
        addedToCalendar: true,
        categoryColor: updatedTask.categoryColor,
        recurringDates: updatedTask.recurringDates,
        updatedAt: serverTimestamp()
      }

      await updateDoc(taskRef, taskData)
      
      toast({
        title: "予定を更新しました",
        description: `${updatedTask.title}の内容を更新しました`,
      })

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id 
            ? { ...task, ...updatedTask }
            : task
        )
      )
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました",
        variant: "destructive"
      })
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    if (confirm('この予定を削除してもよろしいですか？')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        toast({
          title: "予定を削除しました",
          description: "予定が正常に削除されました。",
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "エラー",
          description: "予定の削除中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    }
  };

  const tasksForSelectedDate = tasks.filter(task => {
    const selectedDateWithoutTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    )

    if (task.frequency !== '単発' && task.recurringDates) {
      return task.recurringDates.some(dateStr => {
        const taskDate = new Date(dateStr)
        return (
          taskDate.getFullYear() === selectedDateWithoutTime.getFullYear() &&
          taskDate.getMonth() === selectedDateWithoutTime.getMonth() &&
          taskDate.getDate() === selectedDateWithoutTime.getDate()
        )
      })
    }

    const taskDate = new Date(task.startDate)
    return (
      taskDate.getFullYear() === selectedDateWithoutTime.getFullYear() &&
      taskDate.getMonth() === selectedDateWithoutTime.getMonth() &&
      taskDate.getDate() === selectedDateWithoutTime.getDate()
    )
  })

  console.log('Filtered tasks:', tasksForSelectedDate);

  const handleCreateTask = async (taskData: {
    title: string
    date: Date
    startTime: string
    endTime: string
    categoryColor: string
  }) => {
    try {
      const [startHour, startMinute] = taskData.startTime.split(':').map(Number)
      const [endHour, endMinute] = taskData.endTime.split(':').map(Number)

      const startDate = new Date(taskData.date)
      startDate.setHours(startHour, startMinute)
      
      const endDate = new Date(taskData.date)
      endDate.setHours(endHour, endMinute)

      const task = {
        title: taskData.title,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        frequency: '単発',
        completed: false,
        addedToCalendar: true,
        categoryColor: taskData.categoryColor,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'tasks'), task)
      setIsCreatingTask(false)
      
      toast({
        title: "予定を作成しました",
        description: `${taskData.title}を${startDate.toLocaleString('ja-JP')}に追加しました`,
      })
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "エラー",
        description: "予定の作成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">カレンダー（1週間）</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <div className="sticky top-0 bg-white z-10 py-4">
          <WeeklySlider selectedDate={selectedDate} onDateSelect={handleDateSelect} tasks={tasks} />
        </div>
        <div className="flex-grow overflow-y-auto pb-16">
          <TaskList 
            tasks={tasksForSelectedDate} 
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
          <div className="fixed bottom-20 right-4 flex flex-col gap-2">
            <Button
              className="rounded-full shadow-lg bg-[#4A90E2] hover:bg-[#357ABD] text-white"
              onClick={() => setIsCreatingTask(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              手動で予定を作成
            </Button>
            <Button
              className="rounded-full shadow-lg bg-[#FF6F61] hover:bg-[#FF8075] text-white"
              onClick={() => router.push('/gpt-chat')}
            >
              <Plus className="mr-2 h-4 w-4" />
              GPTで予定を作成
            </Button>
          </div>
        </div>
      </div>
      <TaskCreationModal
        isOpen={isCreatingTask}
        onClose={() => setIsCreatingTask(false)}
        onSave={handleCreateTask}
      />
    </MainLayout>
  )
}

