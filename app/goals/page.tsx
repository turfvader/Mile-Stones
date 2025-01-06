'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '../components/MainLayout'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlusCircle, Settings } from 'lucide-react'
import { db } from '../lib/firebase'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { GoalSkeleton } from '../components/GoalSkeleton'
import { toast } from "@/components/ui/use-toast"

type Goal = {
  id: string
  title: string
  progress: number
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        console.log('Fetching goals...');
        setLoading(true);
        const goalsRef = collection(db, 'goals')
        const q = query(goalsRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        
        const fetchedGoals: Goal[] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title,
            progress: data.overallProgress || 0
          }
        })

        console.log('Fetched goals:', fetchedGoals);
        setGoals(fetchedGoals)
      } catch (err) {
        console.error('Error fetching goals:', err)
        setError('目標の取得中にエラーが発生しました。')
        toast({
          title: "エラー",
          description: "目標の取得中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [])

  const AddNewGoalButton = () => (
    <Button
      className="w-full h-auto py-6 text-lg font-semibold bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
      variant="outline"
      onClick={() => router.push('/set-goal')}
    >
      <PlusCircle className="mr-2 h-5 w-5" />
      新しい目標を追加
    </Button>
  )

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">目標一覧</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <AddNewGoalButton />

        {loading ? (
          <div className="mt-4">
            <GoalSkeleton />
            <GoalSkeleton />
          </div>
        ) : error ? (
          <div className="text-red-500 mt-4">{error}</div>
        ) : goals.length > 0 ? (
          <div className="space-y-4 mt-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">進捗状況</span>
                    <span className="text-sm font-medium">{Math.round(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="mb-4" />
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/goals/${goal.id}`}>
                      詳細を見る
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center mt-4">目標がありません。新しい目標を追加してください。</div>
        )}
      </div>
    </MainLayout>
  )
}

