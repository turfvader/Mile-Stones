'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Edit, Calendar } from 'lucide-react'

type Task = {
  id: string
  title: string
  startDate: string
  endDate: string
  frequency: string
  addedToCalendar: boolean
}

type Milestone = {
  id: string
  title: string
  tasks: Task[]
}

type MilestoneListProps = {
  milestones: Milestone[]
  onEditTask: (milestoneId: string, task: Task) => void
  onToggleCalendar: (milestoneId: string, taskId: string) => void
}

export function MilestoneList({ milestones, onEditTask, onToggleCalendar }: MilestoneListProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {milestones.map((milestone) => (
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
                    期間: {task.startDate} ～ {task.endDate}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    頻度: {task.frequency}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTask(milestone.id, task)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      編集
                    </Button>
                    <Button
                      variant={task.addedToCalendar ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleCalendar(milestone.id, task.id)}
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
  )
}

