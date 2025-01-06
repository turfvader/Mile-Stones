'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash2, CheckSquare } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import TaskEditModal from './TaskEditModal'
import { Task } from '../types/task'

interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
}

export function TaskList({ tasks, onTaskUpdate, onTaskDelete }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-lg shadow relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTask(task)}
              className="mr-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTaskDelete(task.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-gray-600">
            {new Date(task.startDate).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
            ～
            {new Date(task.endDate).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            頻度: {task.frequency}
          </p>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-center text-gray-500">この日の予定はありません</p>
      )}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTaskData) => {
            onTaskUpdate({
              ...editingTask,
              ...updatedTaskData,
              completed: editingTask.completed
            })
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}

