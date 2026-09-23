import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageId,
  Task,
  TaskSection,
  TaskStatus,
  Project,
  ProjectStatus,
  Milestone,
  ForFunItem,
  BodyWellness,
  FocusSession,
  WeekReview,
  UserSettings,
  AppTheme,
  BodyTask,
  CalendarEvent,
  PurchaseItem,
} from '../types';
import { storage } from '../utils/storage';
import { sound } from '../utils/audio';
import { toDateKey } from '../utils/date';
import { useAuth } from './AuthContext';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { focusSessionService } from '../services/focusSessionService';
import { reviewService } from '../services/reviewService';
import { calendarEventService } from '../services/calendarEventService';
import { bodyWellnessService } from '../services/bodyWellnessService';
import { purchaseService } from '../services/purchaseService';

interface AppContextType {
  // Navigation & Modals
  page: PageId;
  setPage: (page: PageId) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isResetOpen: boolean;
  setIsResetOpen: (open: boolean) => void;

  // Settings & Theme
  settings: UserSettings;
  toggleTheme: () => void;
  setCottonCandyPanelMode: (mode: 'light' | 'dark') => void;
  toggleCottonCandyPanelMode: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Tasks
  tasks: Task[];
  rightNowTask: Task | undefined;
  nextTasks: Task[];
  todayCompletedTasksCount: number;
  lifetimeCompletedTasksCount: number;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'status'> & { status?: 'active' | 'completed' }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskAsRightNow: (id: string) => void;
  moveTaskSection: (id: string, section: TaskSection) => void;
  toggleTaskCompleted: (id: string) => void;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;


  // Focus Flow
  activeFocusTask: string;
  setActiveFocusTask: (title: string) => void;
  activeFocusTaskId?: string;
  setActiveFocusTaskId: (id?: string) => void;
  activeFocusProjectId?: string;
  setActiveFocusProjectId: (id?: string) => void;
  activeFocusDuration: number; // in minutes
  setActiveFocusDuration: (minutes: number) => void;
  startFocusWithTask: (taskTitle: string, duration?: number, taskId?: string, projectId?: string) => void;
  focusSessions: FocusSession[];
  logFocusSession: (
    task: string,
    durationMinutes: number,
    completed: boolean,
    notes?: string,
    taskId?: string,
    projectId?: string,
    plannedDurationMinutes?: number,
    durationSeconds?: number
  ) => void;

  // Projects
  projects: Project[];
  addProject: (title: string, description: string, milestones: string[]) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  toggleProjectStatus: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, title: string) => void;
  editMilestone: (projectId: string, milestoneId: string, newTitle: string) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  // For Fun
  forFunItems: ForFunItem[];
  addForFunItem: (title: string, duration?: string) => void;
  deleteForFunItem: (id: string) => void;

  // Body Wellness
  body: BodyWellness;
  bodyEntries: BodyWellness[];
  updateBody: (updates: Partial<BodyWellness>) => void;
  updateBodyForDate: (dateKey: string, updates: Partial<BodyWellness>) => void;
  toggleBodyTask: (taskId: string, dateKey?: string) => void;
  addBodyTask: (title: string, dateKey?: string) => void;
  deleteBodyTask: (taskId: string, dateKey?: string) => void;

  // Review
  reviews: WeekReview[];
  saveReview: (reviewData: Partial<WeekReview>) => void;

  // Purchases
  purchases: PurchaseItem[];
  addPurchaseItem: (name: string, notes?: string) => PurchaseItem;
  updatePurchaseItem: (id: string, updates: Partial<PurchaseItem>) => void;
  togglePurchaseStatus: (id: string) => void;
  discardPurchaseItem: (id: string) => void;
  restorePurchaseItem: (id: string) => void;
  deletePurchaseItem: (id: string) => void;

  // Toasts
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [page, setPage] = useState<PageId>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(storage.getSettings);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [forFunItems, setForFunItems] = useState<ForFunItem[]>(storage.getForFun);
  const [bodyEntries, setBodyEntries] = useState<BodyWellness[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [reviews, setReviews] = useState<WeekReview[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>(storage.getPurchases);

  const [activeFocusTask, setActiveFocusTask] = useState<string>('');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | undefined>(undefined);
  const [activeFocusProjectId, setActiveFocusProjectId] = useState<string | undefined>(undefined);
  const [activeFocusDuration, setActiveFocusDuration] = useState<number>(45);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'cotton-candy', 'cotton-candy-dark-panels');
    if (settings.theme === 'night') {
      root.classList.add('dark');
    } else if (settings.theme === 'cotton_candy') {
      root.classList.add('cotton-candy');
      if (settings.cottonCandyPanelMode === 'dark') {
        root.classList.add('cotton-candy-dark-panels');
      }
    }
    storage.saveSettings(settings);
  }, [settings]);

  // Fetch remote tasks, projects, sessions, reviews, calendar events & purchases from Supabase when user logs in
  useEffect(() => {
    if (!user?.id) {
      setTasks([]);
      setProjects([]);
      setFocusSessions([]);
      setReviews([]);
      setCalendarEvents([]);
      setBodyEntries([]);
      setPurchases(storage.getPurchases());
      return;
    }

    let isMounted = true;

    const fetchCloudData = async () => {
      try {
        const [tasksRes, projectsRes, sessionsRes, reviewsRes, eventsRes, bodyRes, purchasesRes] = await Promise.all([
          taskService.getTasks(user.id),
          projectService.getProjects(user.id),
          focusSessionService.getFocusSessions(user.id),
          reviewService.getReviews(user.id),
          calendarEventService.getEvents(user.id),
          bodyWellnessService.getWellnessEntries(user.id),
          purchaseService.getPurchases(user.id),
        ]);

        if (!isMounted) return;

        if (tasksRes.data) {
          setTasks(tasksRes.data);
        }
        if (projectsRes.data) {
          setProjects(projectsRes.data);
        }
        if (sessionsRes.data) {
          setFocusSessions(sessionsRes.data);
        }
        if (reviewsRes.data) {
          setReviews(reviewsRes.data);
        }
        if (eventsRes.data) {
          setCalendarEvents(eventsRes.data);
        }
        if (bodyRes.data) {
          setBodyEntries(bodyRes.data);
        }
        if (purchasesRes.data && purchasesRes.data.length > 0) {
          setPurchases(purchasesRes.data);
          storage.savePurchases(purchasesRes.data);
        }
      } catch (err) {
        console.error('Failed to load cloud data:', err);
      }
    };

    fetchCloudData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Sync local items with local storage
  useEffect(() => {
    storage.saveForFun(forFunItems);
  }, [forFunItems]);

  useEffect(() => {
    storage.savePurchases(purchases);
  }, [purchases]);



  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      let nextTheme: AppTheme = 'night';
      if (prev.theme === 'night') nextTheme = 'light';
      else if (prev.theme === 'light') nextTheme = 'cotton_candy';
      else nextTheme = 'night';
      return {
        ...prev,
        theme: nextTheme,
      };
    });
  };

  const setCottonCandyPanelMode = (mode: 'light' | 'dark') => {
    setSettings((prev) => ({
      ...prev,
      cottonCandyPanelMode: mode,
    }));
  };

  const toggleCottonCandyPanelMode = () => {
    setSettings((prev) => ({
      ...prev,
      cottonCandyPanelMode: prev.cottonCandyPanelMode === 'dark' ? 'light' : 'dark',
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Dynamic completed counts: Today vs Lifetime
  const todayKey = toDateKey(new Date());
  const todayCompletedTasksCount = tasks.filter(
    (t) => t.status === 'completed' && t.completed_at && toDateKey(t.completed_at) === todayKey
  ).length;
  const lifetimeCompletedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  // Derived tasks
  const rightNowTask = tasks.find((t) => t.is_right_now && t.status === 'active') ||
    tasks.find((t) => t.section === 'now' && t.status === 'active') ||
    tasks.find((t) => t.status === 'active');

  const nextTasks = tasks
    .filter((t) => t.id !== rightNowTask?.id && t.status === 'active')
    .slice(0, 4);


  const addTask = (taskData: Omit<Task, 'id' | 'created_at' | 'status'> & { status?: 'active' | 'completed' }) => {
    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: taskData.title.trim(),
      note: taskData.note?.trim() || undefined,
      status: taskData.status || 'active',
      section: taskData.section || 'now',
      deadline: taskData.deadline?.trim() || undefined,
      estimated_time: taskData.estimated_time?.trim() || undefined,
      created_at: new Date().toISOString(),
      is_right_now: taskData.is_right_now ?? false,
      tags: taskData.tags,
      importance: taskData.importance,
      urgency: taskData.urgency,
      project_id: taskData.project_id,
    };

    if (newTask.is_right_now) {
      setTasks((prev) => [newTask, ...prev.map((t) => ({ ...t, is_right_now: false }))]);
    } else {
      setTasks((prev) => [newTask, ...prev]);
    }

    if (user?.id) {
      taskService.createTask(user.id, newTask).then((res) => {
        if (res.error) {
          console.error('Error creating task in Supabase:', res.error);
          showToast('unable to sync task with cloud');
        }
      }).catch((err) => {
        console.error('Error creating task in Supabase:', err);
        showToast('unable to sync task with cloud');
      });
    }

    if (settings.soundEnabled) sound.playSave();
    showToast('saved');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (user?.id) {
      taskService.updateTask(user.id, id, updates).then((res) => {
        if (res.error) {
          console.error('Error updating task in Supabase:', res.error);
          showToast('unable to sync task with cloud');
        }
      }).catch((err) => {
        console.error('Error updating task in Supabase:', err);
        showToast('unable to sync task with cloud');
      });
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (user?.id) {
      taskService.deleteTask(user.id, id).then((res) => {
        if (res.error) {
          console.error('Error deleting task in Supabase:', res.error);
          showToast('unable to sync task with cloud');
        }
      }).catch((err) => {
        console.error('Error deleting task in Supabase:', err);
        showToast('unable to sync task with cloud');
      });
    }
  };

  const setTaskAsRightNow = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, is_right_now: true, section: 'now' };
        }
        return { ...t, is_right_now: false };
      })
    );
    const target = tasks.find((t) => t.id === id);
    if (target) {
      setActiveFocusTask(target.title);
      setActiveFocusTaskId(target.id);
      setActiveFocusProjectId(target.project_id);
    }
    if (user?.id) {
      taskService.updateTask(user.id, id, { is_right_now: true, section: 'now' }).then((res) => {
        if (res.error) {
          console.error('Error updating right now task in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error updating right now task in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
    showToast('set as right now');
  };

  const moveTaskSection = (id: string, section: TaskSection) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, section } : t))
    );
    if (user?.id) {
      taskService.updateTask(user.id, id, { section }).then((res) => {
        if (res.error) {
          console.error('Error moving task section in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error moving task section in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
  };

  const toggleTaskCompleted = (id: string) => {
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;

    const isNowCompleted = currentTask.status !== 'completed';
    const nextStatus: TaskStatus = isNowCompleted ? 'completed' : 'active';
    const nextCompletedAt = isNowCompleted ? new Date().toISOString() : undefined;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: nextStatus,
              completed_at: nextCompletedAt,
              is_right_now: false,
            }
          : t
      )
    );

    if (user?.id) {
      taskService
        .updateTask(user.id, id, {
          status: nextStatus,
          completed_at: nextCompletedAt,
          is_right_now: false,
        })
        .then((res) => {
          if (res.error) {
            console.error('Error toggling task completion in Supabase:', res.error);
            showToast('unable to sync with cloud');
          }
        })
        .catch((err) => {
          console.error('Error toggling task completion in Supabase:', err);
          showToast('unable to sync with cloud');
        });
    }
    showToast(isNowCompleted ? 'done' : 'marked active');
  };

  const startFocusWithTask = (taskTitle: string, duration?: number, taskId?: string, projectId?: string) => {
    setActiveFocusTask(taskTitle);
    setActiveFocusTaskId(taskId);
    setActiveFocusProjectId(projectId);
    if (duration) {
      setActiveFocusDuration(duration);
    }
    setPage('focus');
  };

  const logFocusSession = (
    task: string,
    durationMinutes: number,
    completed: boolean,
    notes?: string,
    explicitTaskId?: string,
    explicitProjectId?: string,
    plannedDurationMinutes?: number,
    durationSeconds?: number
  ) => {
    const matchedTask = tasks.find((t) => t.id === (explicitTaskId || activeFocusTaskId)) ||
      tasks.find((t) => t.title.toLowerCase().trim() === task.toLowerCase().trim() && t.status === 'active') ||
      (rightNowTask && rightNowTask.title.toLowerCase().trim() === task.toLowerCase().trim() ? rightNowTask : undefined);

    const resolvedTaskId = explicitTaskId || activeFocusTaskId || matchedTask?.id || undefined;
    const resolvedProjectId = explicitProjectId || activeFocusProjectId || matchedTask?.project_id || undefined;

    const actualSeconds = durationSeconds ?? Math.round(durationMinutes * 60);

    const newSession: FocusSession = {
      id: 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      task,
      task_id: resolvedTaskId,
      project_id: resolvedProjectId,
      duration: durationMinutes,
      duration_seconds: actualSeconds,
      planned_duration: plannedDurationMinutes,
      completed,
      notes: notes || undefined,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setFocusSessions((prev) => [newSession, ...prev]);

    if (user?.id) {
      focusSessionService.createFocusSession(user.id, newSession).then((res) => {
        if (res.error) {
          console.error('Error creating focus session in Supabase:', res.error);
          showToast('unable to sync focus session with cloud');
        }
      }).catch((err) => {
        console.error('Error creating focus session in Supabase:', err);
        showToast('unable to sync focus session with cloud');
      });
    }
  };

  // Projects
  const addProject = (title: string, description: string, milestones: string[]) => {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
      milestones: milestones.map((m, i) => ({
        id: 'm-' + Date.now() + '-' + i,
        title: m.trim(),
        completed: false,
      })),
    };
    setProjects((prev) => [newProj, ...prev]);
    if (user?.id) {
      projectService.createProject(user.id, newProj).then((res) => {
        if (res.error) {
          console.error('Error creating project in Supabase:', res.error);
          showToast('unable to sync project with cloud');
        }
      }).catch((err) => {
        console.error('Error creating project in Supabase:', err);
        showToast('unable to sync project with cloud');
      });
    }
    showToast('project created');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    if (user?.id) {
      projectService.updateProject(user.id, id, updates).then((res) => {
        if (res.error) {
          console.error('Error updating project in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error updating project in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
  };

  const toggleProjectStatus = (id: string) => {
    const currentProj = projects.find((p) => p.id === id);
    if (!currentProj) return;

    const newStatus: ProjectStatus = currentProj.status === 'active' ? 'shelf' : 'active';
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    if (user?.id) {
      projectService.updateProject(user.id, id, { status: newStatus }).then((res) => {
        if (res.error) {
          console.error('Error toggling project status in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error toggling project status in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    const currentProj = projects.find((p) => p.id === projectId);
    if (!currentProj) return;

    const updatedMilestones = currentProj.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, milestones: updatedMilestones } : p))
    );

    if (user?.id) {
      projectService.updateProject(user.id, projectId, { milestones: updatedMilestones }).then((res) => {
        if (res.error) {
          console.error('Error updating milestone in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error updating milestone in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
  };

  const addMilestone = (projectId: string, title: string) => {
    const currentProj = projects.find((p) => p.id === projectId);
    if (!currentProj) return;

    const newMilestone: Milestone = {
      id: 'm-' + Date.now(),
      title: title.trim(),
      completed: false,
    };
    const updatedMilestones = [...currentProj.milestones, newMilestone];

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, milestones: updatedMilestones } : p))
    );

    if (user?.id) {
      projectService.updateProject(user.id, projectId, { milestones: updatedMilestones }).then((res) => {
        if (res.error) {
          console.error('Error adding milestone in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error adding milestone in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
  };

  const editMilestone = (projectId: string, milestoneId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const currentProj = projects.find((p) => p.id === projectId);
    if (!currentProj) return;

    const updatedMilestones = currentProj.milestones.map((m) =>
      m.id === milestoneId ? { ...m, title: trimmed } : m
    );

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, milestones: updatedMilestones } : p))
    );

    if (user?.id) {
      projectService.updateProject(user.id, projectId, { milestones: updatedMilestones }).then((res) => {
        if (res.error) {
          console.error('Error updating milestone in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error updating milestone in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
    showToast('milestone updated');
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    const currentProj = projects.find((p) => p.id === projectId);
    if (!currentProj) return;

    const updatedMilestones = currentProj.milestones.filter((m) => m.id !== milestoneId);

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, milestones: updatedMilestones } : p))
    );

    if (user?.id) {
      projectService.updateProject(user.id, projectId, { milestones: updatedMilestones }).then((res) => {
        if (res.error) {
          console.error('Error deleting milestone in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error deleting milestone in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
    showToast('milestone removed');
  };

  // For Fun
  const addForFunItem = (title: string, duration?: string) => {
    const newItem: ForFunItem = {
      id: 'fun-' + Date.now(),
      title: title.trim(),
      duration: duration?.trim() || undefined,
      created_at: new Date().toISOString(),
    };
    setForFunItems((prev) => [newItem, ...prev]);
    showToast('added to for fun');
  };

  const deleteForFunItem = (id: string) => {
    setForFunItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Derived today's body wellness entry
  const todayBody: BodyWellness = bodyEntries.find((b) => b.date === todayKey) || {
    id: 'bw-' + todayKey,
    date: todayKey,
    energy: 7,
    sleep: 'Good',
    movement: 'Planned',
    water: 'Good',
    tasks: [],
  };

  // Body
  const updateBodyForDate = (dateKey: string, updates: Partial<BodyWellness>) => {
    let savedTarget: BodyWellness | undefined;
    setBodyEntries((prev) => {
      const existingIndex = prev.findIndex((b) => b.date === dateKey);
      if (existingIndex >= 0) {
        const updated = {
          ...prev[existingIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        savedTarget = updated;
        const copy = [...prev];
        copy[existingIndex] = updated;
        return copy;
      } else {
        const newEntry: BodyWellness = {
          id: 'bw-' + dateKey + '-' + Math.random().toString(36).substring(2, 6),
          date: dateKey,
          energy: 7,
          sleep: 'Good',
          movement: 'Planned',
          water: 'Good',
          tasks: [],
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        savedTarget = newEntry;
        return [newEntry, ...prev];
      }
    });

    if (user?.id && savedTarget) {
      bodyWellnessService.saveWellnessEntry(user.id, savedTarget).then((res) => {
        if (res.error) {
          console.error('Error saving body wellness in Supabase:', res.error);
          showToast('unable to sync body with cloud');
        }
      }).catch((err) => {
        console.error('Error saving body wellness in Supabase:', err);
        showToast('unable to sync body with cloud');
      });
    }
  };

  const updateBody = (updates: Partial<BodyWellness>) => {
    updateBodyForDate(todayKey, updates);
  };

  const toggleBodyTask = (taskId: string, dateKey = todayKey) => {
    const currentEntry = bodyEntries.find((b) => b.date === dateKey) || {
      id: 'bw-' + dateKey,
      date: dateKey,
      energy: 7,
      sleep: 'Good' as const,
      movement: 'Planned' as const,
      water: 'Good' as const,
      tasks: [],
    };
    const updatedTasks = currentEntry.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateBodyForDate(dateKey, { tasks: updatedTasks });
  };

  const addBodyTask = (title: string, dateKey = todayKey) => {
    const currentEntry = bodyEntries.find((b) => b.date === dateKey) || {
      id: 'bw-' + dateKey,
      date: dateKey,
      energy: 7,
      sleep: 'Good' as const,
      movement: 'Planned' as const,
      water: 'Good' as const,
      tasks: [],
    };
    const newTask: BodyTask = {
      id: 'bt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      completed: false,
    };
    updateBodyForDate(dateKey, { tasks: [...currentEntry.tasks, newTask] });
    showToast('added to body care');
  };

  const deleteBodyTask = (taskId: string, dateKey = todayKey) => {
    const currentEntry = bodyEntries.find((b) => b.date === dateKey);
    if (!currentEntry) return;
    const updatedTasks = currentEntry.tasks.filter((t) => t.id !== taskId);
    updateBodyForDate(dateKey, { tasks: updatedTasks });
  };

  // Reviews
  const saveReview = (reviewData: Partial<WeekReview>) => {
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;
    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
    const activeProjectsCount = projects.filter((p) => p.status === 'active').length;

    const newRev: WeekReview = {
      id: reviewData.id && reviewData.id !== 'rev-current' ? reviewData.id : 'rev-' + Date.now(),
      week: reviewData.week || 'This Week',
      date: reviewData.date || new Date().toISOString(),
      completed: reviewData.completed || {
        focusSessions: focusSessions.length,
        focusHours: totalFocusHours,
        tasksCount: completedTasksCount,
        projectsCount: activeProjectsCount,
      },
      made: reviewData.made || '',
      learned: reviewData.learned || '',
      for_fun: reviewData.for_fun || '',
      next_focus: reviewData.next_focus || '',
    };

    setReviews((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === newRev.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newRev;
        return updated;
      }
      return [newRev, ...prev];
    });

    if (user?.id) {
      reviewService.saveReview(user.id, newRev).then((res) => {
        if (res.error) {
          console.error('Error saving review in Supabase:', res.error);
          showToast('unable to sync review with cloud');
        }
      }).catch((err) => {
        console.error('Error saving review in Supabase:', err);
        showToast('unable to sync review with cloud');
      });
    }

    showToast('review saved');
  };

  // Calendar Events
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent: CalendarEvent = {
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: eventData.title.trim(),
      date: eventData.date,
      start_time: eventData.start_time?.trim() || undefined,
      end_time: eventData.end_time?.trim() || undefined,
      notes: eventData.notes?.trim() || undefined,
      color: eventData.color || 'yellow',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCalendarEvents((prev) => [...prev, newEvent]);

    if (user?.id) {
      calendarEventService.createEvent(user.id, newEvent).then((res) => {
        if (res.error) {
          console.error('Error creating calendar event in Supabase:', res.error);
          showToast('unable to sync event with cloud');
        }
      }).catch((err) => {
        console.error('Error creating calendar event in Supabase:', err);
        showToast('unable to sync event with cloud');
      });
    }

    showToast('event added');
    return newEvent;
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );

    if (user?.id) {
      calendarEventService.updateEvent(user.id, id, updates).then((res) => {
        if (res.error) {
          console.error('Error updating calendar event in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error updating calendar event in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));

    if (user?.id) {
      calendarEventService.deleteEvent(user.id, id).then((res) => {
        if (res.error) {
          console.error('Error deleting calendar event in Supabase:', res.error);
          showToast('unable to sync with cloud');
        }
      }).catch((err) => {
        console.error('Error deleting calendar event in Supabase:', err);
        showToast('unable to sync with cloud');
      });
    }
    showToast('event removed');
  };

  // Purchases
  const addPurchaseItem = (name: string, notes?: string) => {
    const newItem: PurchaseItem = {
      id: 'purch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      notes: notes?.trim() || undefined,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPurchases((prev) => [newItem, ...prev]);

    if (user?.id) {
      purchaseService.createPurchase(user.id, newItem).then((res) => {
        if (res.error) {
          console.error('Error creating purchase item in Supabase:', res.error);
          const isTableMissing = res.error.message?.includes('does not exist') || res.error.message?.includes('not found') || (res.error as any).code === '42P01';
          if (isTableMissing) {
            console.warn('Note: The "purchase_items" table is not created in your Supabase database yet. Items are safely saved locally.');
          } else {
            showToast('unable to sync with cloud');
          }
        }
      }).catch((err) => {
        console.error('Error creating purchase item in Supabase:', err);
      });
    }

    showToast('added to purchase list');
    return newItem;
  };

  const updatePurchaseItem = (id: string, updates: Partial<PurchaseItem>) => {
    // Strictly preserve created_at from existing item
    let savedItem: PurchaseItem | undefined;
    setPurchases((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            ...updates,
            created_at: item.created_at, // Preserve original creation timestamp
            updated_at: new Date().toISOString(),
          };
          savedItem = updated;
          return updated;
        }
        return item;
      })
    );

    if (user?.id && savedItem) {
      purchaseService.updatePurchase(user.id, id, updates).then((res) => {
        if (res.error) {
          console.error('Error updating purchase item in Supabase:', res.error);
          const isTableMissing = res.error.message?.includes('does not exist') || res.error.message?.includes('not found') || (res.error as any).code === '42P01';
          if (!isTableMissing) {
            showToast('unable to sync with cloud');
          }
        }
      }).catch((err) => {
        console.error('Error updating purchase item in Supabase:', err);
      });
    }
  };

  const togglePurchaseStatus = (id: string) => {
    const currentItem = purchases.find((p) => p.id === id);
    if (!currentItem) return;

    const newStatus = currentItem.status === 'active' ? 'purchased' : 'active';
    const purchasedAt = newStatus === 'purchased' ? new Date().toISOString() : undefined;

    setPurchases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              purchased_at: purchasedAt,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );

    if (user?.id) {
      purchaseService.updatePurchase(user.id, id, {
        status: newStatus,
        purchased_at: purchasedAt,
      }).then((res) => {
        if (res.error) {
          console.error('Error updating purchase status in Supabase:', res.error);
          const isTableMissing = res.error.message?.includes('does not exist') || res.error.message?.includes('not found') || (res.error as any).code === '42P01';
          if (!isTableMissing) {
            showToast('unable to sync with cloud');
          }
        }
      }).catch((err) => {
        console.error('Error updating purchase status in Supabase:', err);
      });
    }

    if (newStatus === 'purchased') {
      sound.playComplete();
      showToast('marked as purchased');
    } else {
      showToast('restored to purchase list');
    }
  };

  const discardPurchaseItem = (id: string) => {
    const currentItem = purchases.find((p) => p.id === id);
    if (!currentItem) return;

    const discardedAt = new Date().toISOString();

    setPurchases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'discarded',
              discarded_at: discardedAt,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );

    if (user?.id) {
      purchaseService.updatePurchase(user.id, id, {
        status: 'discarded',
        discarded_at: discardedAt,
      }).then((res) => {
        if (res.error) {
          console.error('Error discarding purchase in Supabase:', res.error);
          const isTableMissing = res.error.message?.includes('does not exist') || res.error.message?.includes('not found') || (res.error as any).code === '42P01';
          if (!isTableMissing) {
            showToast('unable to sync with cloud');
          }
        }
      }).catch((err) => {
        console.error('Error discarding purchase in Supabase:', err);
      });
    }

    showToast('discarded from list');
  };

  const restorePurchaseItem = (id: string) => {
    const currentItem = purchases.find((p) => p.id === id);
    if (!currentItem) return;

    setPurchases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'active',
              purchased_at: undefined,
              discarded_at: undefined,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );

    if (user?.id) {
      purchaseService.updatePurchase(user.id, id, {
        status: 'active',
        purchased_at: undefined,
        discarded_at: undefined,
      }).then((res) => {
        if (res.error) {
          console.error('Error restoring purchase in Supabase:', res.error);
          const isTableMissing = res.error.message?.includes('does not exist') || res.error.message?.includes('not found') || (res.error as any).code === '42P01';
          if (!isTableMissing) {
            showToast('unable to sync with cloud');
          }
        }
      }).catch((err) => {
        console.error('Error restoring purchase in Supabase:', err);
      });
    }

    showToast('restored to purchase list');
  };

  const deletePurchaseItem = (id: string) => {
    setPurchases((prev) => prev.filter((item) => item.id !== id));

    if (user?.id) {
      purchaseService.deletePurchase(user.id, id).then((res) => {
        if (res.error) {
          console.error('Error deleting purchase item in Supabase:', res.error);
          const isTableMissing = res.error.message?.includes('does not exist') || res.error.message?.includes('not found') || (res.error as any).code === '42P01';
          if (!isTableMissing) {
            showToast('unable to sync with cloud');
          }
        }
      }).catch((err) => {
        console.error('Error deleting purchase item in Supabase:', err);
      });
    }
    showToast('item removed');
  };

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        isDrawerOpen,
        setIsDrawerOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isResetOpen,
        setIsResetOpen,
        settings,
        toggleTheme,
        setCottonCandyPanelMode,
        toggleCottonCandyPanelMode,
        updateSettings,
        tasks,
        rightNowTask,
        nextTasks,
        todayCompletedTasksCount,
        lifetimeCompletedTasksCount,
        addTask,
        updateTask,
        deleteTask,
        setTaskAsRightNow,
        moveTaskSection,
        toggleTaskCompleted,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        activeFocusTask,
        setActiveFocusTask,
        activeFocusTaskId,
        setActiveFocusTaskId,
        activeFocusProjectId,
        setActiveFocusProjectId,
        activeFocusDuration,
        setActiveFocusDuration,
        startFocusWithTask,
        focusSessions,
        logFocusSession,
        projects,
        addProject,
        updateProject,
        toggleProjectStatus,
        toggleMilestone,
        addMilestone,
        editMilestone,
        deleteMilestone,
        forFunItems,
        addForFunItem,
        deleteForFunItem,
        purchases,
        addPurchaseItem,
        updatePurchaseItem,
        togglePurchaseStatus,
        discardPurchaseItem,
        restorePurchaseItem,
        deletePurchaseItem,
        body: todayBody,
        bodyEntries,
        updateBody,
        updateBodyForDate,
        toggleBodyTask,
        addBodyTask,
        deleteBodyTask,
        reviews,
        saveReview,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
