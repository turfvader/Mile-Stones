'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../../components/MainLayout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Send, X } from 'lucide-react'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { toast } from '@/components/ui/use-toast'

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

const SYSTEM_PROMPT = `
あなたは予定作成のアシスタントです。以下の規則に従って応答してください：

1. ユーザーの入力から日付、時間、予定内容を抽出してください。

2. 日付の解釈について：
   - 「今日」と言われたら、${new Date().toLocaleDateString('ja-JP')}として解釈してください
   - 「明日」と言われたら、翌日の日付として解釈してください
   - 「明後日」と言われたら、2日後の日付として解釈してください
   - 「来週」と言われたら、7日後の日付として解釈してください

3. 時間が指定されていない場合は、時間を具体的に質問してください。
   例：「何時からにしますか？」

4. 必要な情報が揃ったら、以下のJSON形式で応答してください：
{
  "type": "confirmation",
  "task": {
    "date": "YYYY/MM/DD",
    "time": "HH:mm-HH:mm",
    "title": "予定内容",
    "frequency": "単発"
  },
  "message": "○月○日 ○時に「○○」を追加します。よろしいですか？"
}

5. 修正要求があった場合は、修正点を確認し、再度確認メッセージを表示してください。

例：
ユーザー：「今日の3時にミーティング」
システム：{
  "type": "confirmation",
  "task": {
    "date": "${new Date().toISOString().split('T')[0].replace(/-/g, '/')}",
    "time": "15:00-16:00",
    "title": "ミーティング",
    "frequency": "単発"
  },
  "message": "${new Date().getMonth() + 1}月${new Date().getDate()}日 15時に「ミーティング」を追加します。よろしいですか？"
}
`

type Message = {
  role: 'user' | 'ai' | 'assistant' | 'system'
  content: string
}

type ProposedTask = {
  title: string
  date: string
  time: string
  frequency: string
}

export default function GPTChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '何を予定に入れたいですか？' }
  ])
  const [input, setInput] = useState('')
  const [proposedTask, setProposedTask] = useState<ProposedTask | null>(null)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const callChatGPT = async (userInput: string, previousMessages: Message[] = []) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...previousMessages.map(msg => ({
              role: msg.role === 'ai' ? 'assistant' : 'user' as const,
              content: msg.content
            })),
            { role: 'user', content: userInput }
          ]
        })
      })

      const data = await response.json()
      const content = data.choices[0].message.content

      try {
        const parsedContent = JSON.parse(content)
        if (parsedContent.type === 'confirmation') {
          setProposedTask(parsedContent.task)
          return parsedContent.message
        }
      } catch {
        // JSONでない場合は通常のメッセージとして扱う
      }

      return content
    } catch (error) {
      console.error('Error calling ChatGPT API:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { role: 'user' as const, content: input }]
      setMessages(newMessages)
      setInput('')

      try {
        const aiResponse = await callChatGPT(input, messages)
        setMessages(prev => [...prev, { role: 'ai' as const, content: aiResponse }])
      } catch (error) {
        toast({
          title: "エラー",
          description: "AIの応答中にエラーが発生しました。",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddTask = async () => {
    if (proposedTask) {
      try {
        console.log('Proposed task:', proposedTask);
        
        const [startTime, endTime] = proposedTask.time.split('-');
        const [year, month, day] = proposedTask.date.split('/').map(Number);
        
        console.log('Date parts:', { year, month, day });
        console.log('Time parts:', { startTime, endTime });

        const [startHour, startMinute] = startTime.split(':').map(Number);
        
        let endHour = startHour, endMinute = startMinute;
        if (endTime) {
          [endHour, endMinute] = endTime.split(':').map(Number);
        } else {
          endHour = startHour + 1;
        }

        const startDate = new Date(year, month - 1, day, startHour, startMinute);
        const endDate = new Date(year, month - 1, day, endHour, endMinute);

        const taskData = {
          title: proposedTask.title,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          frequency: proposedTask.frequency || '単発',
          completed: false,
          addedToCalendar: true,
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'tasks'), taskData);

        toast({
          title: "予定を追加しました",
          description: `${proposedTask.title}を${startDate.toLocaleString('ja-JP')}に追加しました`,
        });

        router.push('/calendar');
      } catch (error) {
        console.error('Error adding task:', error);
        toast({
          title: "エラー",
          description: "予定の追加に失敗しました。もう一度お試しください。",
          variant: "destructive",
        });
      }
    }
  };

  const handleSkip = () => {
    setProposedTask(null)
    setMessages([...messages, { role: 'ai', content: '他に予定を入れたいものはありますか？' }])
  }

  return (
    <MainLayout title="予定作成チャット" showCloseButton={true}>
      <div className="flex flex-col h-full max-w-2xl mx-auto px-4">
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {proposedTask && (
          <div className="mb-4">
            <p className="text-center mb-2">この予定をカレンダーに追加しますか？</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleAddTask} className="bg-[#FF6F61] hover:bg-[#FF8075] text-white">
                追加する
              </Button>
              <Button onClick={handleSkip} variant="outline">
                スキップ
              </Button>
            </div>
          </div>
        )}
        <div className="flex space-x-2 mb-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="予定を変更する場合は内容を入力してください"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-[#007AFF] hover:bg-[#66B2FF] text-white transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}

