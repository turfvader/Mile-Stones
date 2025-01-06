'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GoalSettingContextType {
  goalTitle: string;
  setGoalTitle: (title: string) => void;
  targetValue: number;
  setTargetValue: (value: number) => void;
  deadline: Date | null;
  setDeadline: (date: Date | null) => void;
  currentStep: string;
  setCurrentStep: (step: string) => void;
  milestones: any[];
  setMilestones: (milestones: any[]) => void;
  goalDate: string;
  setGoalDate: (date: string) => void;
  resetGoalSetting: () => void;
}

const GoalSettingContext = createContext<GoalSettingContextType | undefined>(undefined);

export function GoalSettingProvider({ children }: { children: ReactNode }) {
  const [goalTitle, setGoalTitle] = useState('');
  const [targetValue, setTargetValue] = useState(0);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [goalDate, setGoalDate] = useState('');

  const resetGoalSetting = () => {
    setGoalTitle('');
    setTargetValue(0);
    setDeadline(null);
    setCurrentStep('');
    setMilestones([]);
    setGoalDate('');
  };

  return (
    <GoalSettingContext.Provider value={{
      goalTitle,
      setGoalTitle,
      targetValue,
      setTargetValue,
      deadline,
      setDeadline,
      currentStep,
      setCurrentStep,
      milestones,
      setMilestones,
      goalDate,
      setGoalDate,
      resetGoalSetting,
    }}>
      {children}
    </GoalSettingContext.Provider>
  );
}

export function useGoalSetting() {
  const context = useContext(GoalSettingContext);
  if (context === undefined) {
    throw new Error('useGoalSetting must be used within a GoalSettingProvider');
  }
  return context;
}