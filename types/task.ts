export interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  frequency: string;
  completed: boolean;
  addedToCalendar: boolean;
  categoryColor?: string;
  recurringDates?: string[];
} 