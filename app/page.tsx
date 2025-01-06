'use client'

import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <MainLayout showBackButton={false}>
      <div className="flex flex-col items-center gap-8 p-4">
        <Button asChild className="w-64">
          <Link href="/set-goal">新しい目標を設定する</Link>
        </Button>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>最近追加された目標</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/goals/1" className="block hover:bg-gray-100 rounded-lg p-4 transition-colors">
              <h3 className="text-lg font-medium">1ヶ月で体重を3kg減らす</h3>
              <Progress value={33} className="mt-2" />
              <p className="text-sm text-gray-600 mt-1">達成率: 33%</p>
            </Link>
            {/* Add more recent goals here */}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

