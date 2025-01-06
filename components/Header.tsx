'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface HeaderProps {
  title?: string
  showCloseButton?: boolean
}

export default function Header({ title, showCloseButton }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">{title}</h1>
        {showCloseButton && (
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
    </header>
  )
} 