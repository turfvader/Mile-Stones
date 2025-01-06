import Link from 'next/link'
import { Home, Calendar, List, User } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white shadow w-full mt-auto">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ul className="flex justify-around">
          <li>
            <Link href="/" className="text-gray-600 hover:text-primary">
              <Home className="w-6 h-6 mx-auto" />
              <span className="text-xs">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/calendar" className="text-gray-600 hover:text-primary">
              <Calendar className="w-6 h-6 mx-auto" />
              <span className="text-xs">Calendar</span>
            </Link>
          </li>
          <li>
            <Link href="/goals" className="text-gray-600 hover:text-primary">
              <List className="w-6 h-6 mx-auto" />
              <span className="text-xs">Goals</span>
            </Link>
          </li>
          <li>
            <Link href="/profile" className="text-gray-600 hover:text-primary">
              <User className="w-6 h-6 mx-auto" />
              <span className="text-xs">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  )
}

