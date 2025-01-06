import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { GoalSettingProvider } from '@/components/GoalSettingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Mile Stones',
  description: 'Track your goals and achievements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <GoalSettingProvider>
          {children}
        </GoalSettingProvider>
      </body>
    </html>
  )
}

