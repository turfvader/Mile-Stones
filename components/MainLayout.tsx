'use client'

import Header from './Header'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  showCloseButton?: boolean
}

export default function MainLayout({ children, title, showCloseButton }: MainLayoutProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={title} showCloseButton={showCloseButton} />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-center">
        <nav className="flex space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/calendar')}
          >
            カレンダー
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/goals')}
          >
            目標一覧
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings')}
          >
            設定
          </Button>
        </nav>
      </footer>
    </div>
  )
} 