'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../../components/MainLayout'
import { Button } from '../../components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import { Edit, Calendar } from 'lucide-react'
import { toast } from "../../components/ui/use-toast"
import TaskEditModal from '../../components/TaskEditModal'
import { db } from '../lib/firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { useGoalSetting } from '../contexts/GoalSettingContext'
import { Task } from '../../types/task'

type Milestone = {
  id: string
  title: string
  tasks: Task[]
}

export default function CreateMilestones() {
  const router = useRouter()
  const { 
    goalTitle: goal, 
    goalDate, 
    targetValue,
    milestones, 
    setMilestones, 
    setCurrentStep, 
    resetGoalSetting 
  } = useGoalSetting()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  useEffect(() => {
    setCurrentStep('create-milestones')
    if (milestones.length === 0) {
      generateInitialMilestones()
    }
  }, [setCurrentStep, milestones.length])

  const generateInitialMilestones = () => {
    // Simulate AI-generated milestones based on the current status conversation
    const conversation = JSON.parse(localStorage.getItem('currentStatusMessages') || '[]')
    // Here you would typically send this conversation to your AI service to generate milestones
    // For now, we'll use a mock response
    const generatedMilestones: Milestone[] = [
      {
        id: '1',
        title: '単語を1週間で200個覚える',
        tasks: [
          {
            id: '1-1',
            title: '英単語帳のUnit 1-10を覚える',
            startDate: '2024-12-01',
            endDate: '2024-12-07',
            frequency: '毎日20分',
            addedToCalendar: false,
            completed: false
          },
          {
            id: '1-2',
            title: '英単語帳のUnit 11-20を覚える',
            startDate: '2024-12-08',
            endDate: '2024-12-14',
            frequency: '毎日20分',
            addedToCalendar: false,
            completed: false
          }
        ]
      },
      {
        id: '2',
        title: '問題集を1ヶ月で解く',
        tasks: [
          {
            id: '2-1',
            title: 'リーディングセクションの問題を解く',
            startDate: '2024-12-15',
            endDate: '2024-12-31',
            frequency: '週3回、1時間ずつ',
            addedToCalendar: false,
            completed: false
          },
          {
            id: '2-2',
            title: 'リスニングセクションの問題を解く',
            startDate: '2025-01-01',
            endDate: '2025-01-15',
            frequency: '週3回、1時間ずつ',
            addedToCalendar: false,
            completed: false
          }
        ]
      }
    ]
    setMilestones(generatedMilestones)
  }

  const handleEditTask = (milestoneId: string, task: Task) => {
    setCurrentMilestone(milestoneId)
    setCurrentTask(task)
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = (updatedTask: Partial<Task>) => {
    if (currentMilestone) {
      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === currentMilestone) {
          const updatedTasks = milestone.tasks.map((task: Task) => 
            task.id === currentTask?.id ? { ...task, ...updatedTask } : task
          )
          return { ...milestone, tasks: updatedTasks }
        }
        return milestone
      })
      setMilestones(updatedMilestones)
    }
    setIsTaskModalOpen(false)
    setCurrentMilestone(null)
    setCurrentTask(null)
  }

  const handleToggleCalendar = async (milestoneId: string, taskId: string) => {
    const updatedMilestones = milestones.map((milestone: Milestone) => {
      if (milestone.id === milestoneId) {
        const updatedTasks = milestone.tasks.map((task: Task) => {
          if (task.id === taskId) {
            return { ...task, addedToCalendar: !task.addedToCalendar }
          }
          return task
        })
        return { ...milestone, tasks: updatedTasks }
      }
      return milestone
    })
    setMilestones(updatedMilestones)
    
    const task = milestones
      .find((m: Milestone) => m.id === milestoneId)
      ?.tasks.find((t: Task) => t.id === taskId)
    if (task) {
      if (!task.addedToCalendar) {
        try {
          await addDoc(collection(db, 'tasks'), {
            title: task.title,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
            frequency: task.frequency,
            completed: false,
            addedToCalendar: true
          })
          toast({
            title: "タスクをカレンダーに追加しました",
            description: `${task.title}`,
          })
        } catch (error) {
          console.error("Error adding task to calendar: ", error)
          toast({
            title: "エラー",
            description: "タスクの追加中にエラーが発生しました。",
            variant: "destructive",
          })
        }
      } else {
        // Here you would typically remove the task from Firestore
        // For now, we'll just show a toast
        toast({
          title: "タスクをカレンダーから削除しました",
          description: `${task.title}`,
        })
      }
    }
  }

  const handleConfirm = async () => {
    if (milestones.length > 0) {
      try {
        // Save goal to Firebase
        const goalRef = await addDoc(collection(db, 'goals'), {
          title: goal,
          dueDate: new Date(goalDate),
          createdAt: new Date(),
          milestones: milestones.map(milestone => ({
            ...milestone,
            tasks: milestone.tasks.map((task: Task) => ({
              ...task,
              startDate: task.startDate ? new Date(task.startDate) : new Date(),
              endDate: task.endDate ? new Date(task.endDate) : new Date(),
            }))
          }))
        })

        console.log('Goal added successfully:', goalRef.id);

        // Update tasks in Firestore
        for (const milestone of milestones) {
          for (const task of milestone.tasks) {
            if (task.addedToCalendar) {
              await updateDoc(doc(db, 'tasks', task.id), {
                addedToCalendar: true,
                goalId: goalRef.id
              })
            }
          }
        }

        toast({
          title: "目標とマイルストーンを保存しました",
          description: "目標一覧に追加されました。",
        })
        
        // Reset goal setting state
        resetGoalSetting()

        router.push('/goals')
      } catch (error) {
        console.error("Error adding goal and milestones to Firebase: ", error)
        toast({
          title: "エラー",
          description: "目標とマイルストーンの保存中にエラーが発生しました。",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "注意",
        description: "マイルストーンが設定されていません。",
      })
    }
  }

  const handleSaveGoal = async () => {
    try {
      if (!goal || !goalDate || !targetValue) {
        toast({
          title: "エラー",
          description: "すべての必須項目を入力してください。",
          variant: "destructive",
        });
        return;
      }

      const goalRef = await addDoc(collection(db, "goals"), {
        title: goal,
        targetDate: new Date(goalDate),
        targetValue: targetValue,
        createdAt: new Date(),
      });

      // ... 残りのコード
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "エラー",
        description: "目標の保存中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout title="マイルストーン作成" showCloseButton={true}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2">{goal}</h2>
        <p className="text-gray-600 mb-6">目標期限：{new Date(goalDate).toLocaleDateString('ja-JP')}</p>
        <Accordion type="single" collapsible className="w-full mb-6">
          {milestones.map((milestone) => (
            <AccordionItem key={milestone.id} value={milestone.id}>
              <AccordionTrigger className="text-left font-semibold">
                {milestone.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {milestone.tasks.map((task: Task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        期間: {task.startDate} ～ {task.endDate}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        頻度: {task.frequency}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTask(milestone.id, task)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </Button>
                        <Button
                          variant={task.addedToCalendar ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleCalendar(milestone.id, task.id)}
                          className={task.addedToCalendar ? "bg-[#FF6F61] hover:bg-[#FF8075] text-white" : ""}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          {task.addedToCalendar ? 'カレンダーから削除' : 'カレンダーに追加'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex justify-between space-x-4">
          <Button onClick={() => router.back()} variant="outline" className="w-1/2 bg-[#FF6F61] hover:bg-[#FF8075] text-white transition-all duration-200 ease-in-out transform hover:scale-95">
            戻る
          </Button>
          <Button onClick={handleConfirm} className="w-1/2 bg-[#FF6F61] hover:bg-[#FF8075] text-white transition-all duration-200 ease-in-out transform hover:scale-95">
            確定
          </Button>
        </div>
      </div>
      {currentTask && (
        <TaskEditModal
          isOpen={true}
          onClose={() => setCurrentTask(null)}
          onSave={handleSaveTask}
          task={currentTask}
        />
      )}
    </MainLayout>
  )
}

