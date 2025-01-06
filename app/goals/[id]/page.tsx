'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from 'lucide-react'
import { db } from '../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { toast } from "@/components/ui/use-toast"
import { GoalDetailSkeleton } from '@/components/GoalDetailSkeleton'

type Task = {
  id: string
  title: string
  startDate: Date
  endDate: Date
  frequency: string
  completed: boolean
  addedToCalendar: boolean
  progress: number
}

type Milestone = {
  id: string
  title: string
  tasks: Task[]
  progress: number
}

type Goal = {
  id: string
  title: string
  dueDate: Date
  milestones: Milestone[]
  progress: number
}

export default function GoalProgressPage({ params }: { params: { id: string } }) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log('GoalProgressPage mounted. Goal ID:', params.id);
    fetchGoal();
  }, [params.id])

  const fetchGoal = async () => {
    console.log('Fetching goal data...');
    setLoading(true);
    try {
      const goalDoc = await getDoc(doc(db, 'goals', params.id))
      console.log('Goal document fetch result:', goalDoc);
      if (goalDoc.exists()) {
        console.log('Goal document found:', goalDoc.data());
        const goalData = goalDoc.data()
        const formattedGoal = {
          id: goalDoc.id,
          title: goalData.title,
          dueDate: goalData.dueDate.toDate(),
          milestones: goalData.milestones.map((milestone: any) => ({
            ...milestone,
            progress: calculateMilestoneProgress(milestone.tasks),
            tasks: milestone.tasks.map((task: any) => ({
              ...task,
              startDate: task.startDate.toDate(),
              endDate: task.endDate.toDate(),
              addedToCalendar: task.addedToCalendar || false,
              progress: calculateTaskProgress(task),
            }))
          })),
          progress: 0,
        };
        formattedGoal.progress = calculateGoalProgress(formattedGoal.milestones);
        console.log('Formatted goal:', formattedGoal);
        setGoal(formattedGoal);
      } else {
        console.log('Goal document not found');
        setError('目標が見つかりません。')
        toast({
          title: "エラー",
          description: "目標が見つかりません。",
          variant: "destructive",
        })
        router.push('/goals')
      }
    } catch (err) {
      console.error('Error fetching goal:', err);
      setError('目標の取得中にエラーが発生しました。しばらくしてからもう一度お試しください。')
      toast({
        title: "エラー",
        description: "目標の取得中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskProgress = (task: Task) => {
    const now = new Date();
    const start = task.startDate;
    const end = task.endDate;
    
    if (now < start) return 0;
    if (now > end) return task.completed ? 100 : 0;
    
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    const daysPassed = (now.getTime() - start.getTime()) / (1000 * 3600 * 24);
    
    return Math.min(100, (daysPassed / totalDays) * 100);
  };

  const calculateMilestoneProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return totalProgress / tasks.length;
  };

  const calculateGoalProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const totalProgress = milestones.reduce((sum, milestone) => sum + milestone.progress, 0);
    return totalProgress / milestones.length;
  };

  const handleTaskToggle = async (milestoneId: string, taskId: string) => {
    if (!goal) return

    const updatedMilestones = goal.milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        const updatedTasks = milestone.tasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task, completed: !task.completed };
            updatedTask.progress = calculateTaskProgress(updatedTask);
            return updatedTask;
          }
          return task;
        });
        const updatedMilestone = { ...milestone, tasks: updatedTasks };
        updatedMilestone.progress = calculateMilestoneProgress(updatedTasks);
        return updatedMilestone;
      }
      return milestone;
    });

    const updatedGoal = { ...goal, milestones: updatedMilestones };
    updatedGoal.progress = calculateGoalProgress(updatedMilestones);

    setGoal(updatedGoal);

    try {
      await updateDoc(doc(db, 'goals', goal.id), {
        milestones: updatedMilestones,
        progress: updatedGoal.progress,
      });
      toast({
        title: "タスクの状態を更新しました",
        description: "変更が保存されました。",
      });
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "エラー",
        description: "タスクの更新中にエラーが発生しました。",
        variant: "destructive",
      });
      setGoal(prevGoal => prevGoal);
    }
  };

  const handleToggleCalendar = async (milestoneId: string, taskId: string) => {
    if (!goal) return

    const updatedMilestones = goal.milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        const updatedTasks = milestone.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, addedToCalendar: !task.addedToCalendar }
          }
          return task
        })
        return { ...milestone, tasks: updatedTasks }
      }
      return milestone
    })

    setGoal({ ...goal, milestones: updatedMilestones })

    try {
      await updateDoc(doc(db, 'goals', goal.id), {
        milestones: updatedMilestones
      })
      const task = goal.milestones.find(m => m.id === milestoneId)?.tasks.find(t => t.id === taskId)
      if (task) {
        toast({
          title: task.addedToCalendar ? "タスクをカレンダーから削除しました" : "タスクをカレンダーに追加しました",
          description: `${task.title}`,
        })
      }
    } catch (err) {
      console.error('Error updating task:', err)
      toast({
        title: "エラー",
        description: "タスクの更新中にエラーが発生しました。",
        variant: "destructive",
      })
      setGoal(prevGoal => prevGoal)
    }
  }

  if (loading) {
    return (
      <MainLayout title="読み込み中...">
        <GoalDetailSkeleton />
      </MainLayout>
    )
  }

  if (error) {
    return <MainLayout title="エラー"><div>{error}</div></MainLayout>
  }

  if (!goal) {
    return <MainLayout title="エラー"><div>目標が見つかりません。</div></MainLayout>
  }

  return (
    <MainLayout title="進捗確認" showCloseButton={true}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2">{goal.title}</h2>
        <p className="text-gray-600 mb-6">目標期限：{goal.dueDate.toLocaleDateString('ja-JP')}</p>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">進捗状況</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-100">
                  進行中
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {Math.round(goal.progress)}%
                </span>
              </div>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
        </div>
        <Accordion type="single" collapsible className="w-full mb-6">
          {goal.milestones.map((milestone) => (
            <AccordionItem key={milestone.id} value={milestone.id}>
              <AccordionTrigger className="text-left font-semibold">
                {milestone.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {milestone.tasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        期間: {task.startDate.toLocaleDateString()} ～ {task.endDate.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        頻度: {task.frequency}
                      </p>
                      <div className="flex justify-between items-center">
                        <Progress value={task.progress} className="w-1/2" />
                        <span className="text-sm font-medium">{Math.round(task.progress)}%</span>
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <div
                          className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                            task.completed
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                          }`}
                          onClick={() => handleTaskToggle(milestone.id, task.id)}
                        >
                          <Checkbox checked={task.completed} className="mr-2" />
                          {task.completed ? '完了' : '未完了'}
                        </div>
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
        <Button onClick={() => router.push('/goals')} variant="outline" className="w-full">
          目標一覧に戻る
        </Button>
      </div>
    </MainLayout>
  )
}

