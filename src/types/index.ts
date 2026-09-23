export type TaskSection = 'now' | 'next' | 'later';
export type TaskStatus = 'active' | 'completed';

export type TaskTag = 'Important' | 'Not Important' | 'Urgent' | 'Not Urgent';
export type TaskImportance = 'Important' | 'Not Important';
export type TaskUrgency = 'Urgent' | 'Not Urgent';

export interface Task {
  id: string;
  title: string;
  note?: string;
  status: TaskStatus;
  section: TaskSection;
  deadline?: string;
  scheduled_date?: string; // YYYY-MM-DD format for calendar integration
  estimated_time?: string;
  created_at: string;
  completed_at?: string;
  is_right_now?: boolean;
  tags?: TaskTag[];
  importance?: TaskImportance;
  urgency?: TaskUrgency;
  project_id?: string;
}

export type CalendarEventColor = 'yellow' | 'blue' | 'lavender' | 'sage' | 'pink' | 'mauve';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time?: string; // e.g. "10:00" or "10:00 AM"
  end_time?: string; // e.g. "11:30" or "11:30 AM"
  notes?: string;
  color?: CalendarEventColor;
  created_at?: string;
  updated_at?: string;
}


export type ProjectStatus = 'active' | 'shelf';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  milestones: Milestone[];
  created_at: string;
}

export interface FocusSession {
  id: string;
  task: string;
  task_id?: string;
  project_id?: string;
  project?: string;
  duration: number; // actual focused duration in minutes
  duration_seconds?: number; // actual focused duration in seconds
  planned_duration?: number; // planned session duration in minutes
  completed: boolean;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface ForFunItem {
  id: string;
  title: string;
  duration?: string;
  created_at: string;
  last_enjoyed?: string;
}

export type SleepQuality = 'Good' | 'Okay' | 'Needs care';
export type MovementStatus = 'Done' | 'Planned';
export type WaterStatus = 'Good' | 'More';

export interface BodyTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface BodyWellness {
  id?: string;
  date: string; // YYYY-MM-DD
  energy: number; // 1 - 10
  sleep: SleepQuality;
  movement: MovementStatus;
  water: WaterStatus;
  tasks: BodyTask[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}


export interface WeekReview {
  id: string;
  week: string; // e.g. "Week of Sep 16, 2026"
  date: string;
  completed: {
    focusSessions: number;
    focusHours: number;
    tasksCount: number;
    projectsCount: number;
  };
  made: string;
  learned: string;
  for_fun: string;
  next_focus: string;
}

export type PurchaseStatus = 'active' | 'purchased' | 'discarded';

export interface PurchaseItem {
  id: string;
  name: string;
  notes?: string;
  status: PurchaseStatus;
  created_at: string;
  purchased_at?: string;
  discarded_at?: string;
  updated_at?: string;
}

export type AppTheme = 'night' | 'light' | 'cotton_candy';
export type CottonCandyPanelMode = 'light' | 'dark';

export interface UserSettings {
  theme: AppTheme;
  cottonCandyPanelMode?: CottonCandyPanelMode;
  focusDuration: number;
  soundEnabled: boolean;
}

export type PageId = 'home' | 'focus' | 'tasks' | 'projects' | 'body' | 'for_fun' | 'review' | 'purchases';

