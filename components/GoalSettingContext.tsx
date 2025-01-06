'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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

type GoalSettingContextType = {
  goal: string
  setGoal: (goal: string) => void
  goalDate: string
  setGoalDate: (date: string) => void
  milestones: Milestone[]
  setMilestones: (milestones: Milestone[]) => void
  currentStep: 'set-goal' | 'current-status' | 'create-milestones'
  setCurrentStep: (step: 'set-goal' | 'current-status' | 'create-milestones') => void
  resetGoalSetting: () => void
}

const GoalSettingContext = createContext<GoalSettingContextType | undefined>(undefined)

export const useGoalSetting = () => {
  const context = useContext(GoalSettingContext)
  if (context === undefined) {
    throw new Error('useGoalSetting must be used within a GoalSettingProvider')
  }
  return context
}

export const GoalSettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goal, setGoal] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [currentStep, setCurrentStep] = useState<'set-goal' | 'current-status' | 'create-milestones'>('set-goal')

  useEffect(() => {
    // Load saved state from localStorage
    const savedGoal = localStorage.getItem('userGoal')
    const savedGoalDate = localStorage.getItem('userGoalDate')
    const savedMilestones = localStorage.getItem('userMilestones')
    const savedCurrentStep = localStorage.getItem('currentGoalStep')
    
    if (savedGoal) setGoal(savedGoal)
    if (savedGoalDate) setGoalDate(savedGoalDate)
    if (savedMilestones) setMilestones(JSON.parse(savedMilestones))
    if (savedCurrentStep) setCurrentStep(savedCurrentStep as 'set-goal' | 'current-status' | 'create-milestones')
  }, [])

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem('userGoal', goal)
    localStorage.setItem('userGoalDate', goalDate)
    localStorage.setItem('userMilestones', JSON.stringify(milestones))
    localStorage.setItem('currentGoalStep', currentStep)
  }, [goal, goalDate, milestones, currentStep])

  const resetGoalSetting = () => {
    setGoal('')
    setGoalDate('')
    setMilestones([])
    setCurrentStep('set-goal')
    localStorage.removeItem('userGoal')
    localStorage.removeItem('userGoalDate')
    localStorage.removeItem('userMilestones')
    localStorage.removeItem('currentGoalStep')
  }

  return (
    <GoalSettingContext.Provider value={{
      goal, setGoal,
      goalDate, setGoalDate,
      milestones, setMilestones,
      currentStep, setCurrentStep,
      resetGoalSetting
    }}>
      {children}
    </GoalSettingContext.Provider>
  )
}

