'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../components/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGoalSetting } from '../contexts/GoalSettingContext'

type Message = {
  role: 'user' | 'ai'
  content: string
}

export default function CurrentStatus() {
  const router = useRouter()
  const { setCurrentStep } = useGoalSetting()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '目標達成に必要な時間はどの程度確保できますか？' }
  ])
  const [input, setInput] = useState('')

  useEffect(() => {
    setCurrentStep('current-status')
    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem('currentStatusMessages')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [setCurrentStep])

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem('currentStatusMessages', JSON.stringify(messages))
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim()) {
      const updatedMessages = [...messages, { role: 'user', content: input }]
      setMessages(updatedMessages)
      setInput('')
      // Simulate AI response
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { 
          role: 'ai', 
          content: 'これまでに似た目標を達成した経験はありますか？' 
        }])
      }, 1000)
    }
  }

  const handleNext = () => {
    setCurrentStep('create-milestones')
    router.push('/create-milestones')
  }

  return (
    <MainLayout title="現在地確認" showCloseButton={true}>
      <div className="max-w-2xl mx-auto">
        <ScrollArea className="h-[60vh] mb-4 p-4 border rounded-md">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {message.content}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex space-x-2 mb-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>送信</Button>
        </div>
        <Button onClick={handleNext} className="w-full bg-[#FF6F61] hover:bg-[#FF8075] text-white">
          次へ（マイルストーン作成画面）
        </Button>
      </div>
    </MainLayout>
  )
}

