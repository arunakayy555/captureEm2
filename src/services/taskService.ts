import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskTag } from '../types';

/**
 * Transforms Supabase database row to client Task model
 */
const mapRowToTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  note: row.note || undefined,
  status: row.status as 'active' | 'completed',
  section: row.section as 'now' | 'next' | 'later',
  deadline: row.deadline || undefined,
  estimated_time: row.estimated_time || undefined,
  created_at: row.created_at,
  completed_at: row.completed_at || undefined,
  is_right_now: Boolean(row.is_right_now),
  tags: (row.tags as TaskTag[]) || [],
  importance: row.importance || undefined,
  urgency: row.urgency || undefined,
  project_id: row.project_id || undefined,
});

/**
 * Transforms client Task model to Supabase database row format
 */
const mapTaskToRow = (userId: string, task: Task) => ({
  id: task.id,
  user_id: userId,
  title: task.title,
  note: task.note || null,
  status: task.status,
  section: task.section,
  deadline: task.deadline || null,
  estimated_time: task.estimated_time || null,
  is_right_now: Boolean(task.is_right_now),
  tags: task.tags || [],
  importance: task.importance || null,
  urgency: task.urgency || null,
  project_id: task.project_id || null,
  created_at: task.created_at,
  completed_at: task.completed_at || null,
});

export const taskService = {
  /**
   * Fetch all tasks belonging to the authenticated user
   */
  async getTasks(userId: string): Promise<{ data: Task[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToTask), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create a new task in Supabase
   */
  async createTask(userId: string, task: Task): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapTaskToRow(userId, task);
      const { error } = await supabase.from('tasks').insert(row);
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },

  /**
   * Update an existing task in Supabase
   */
  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const updateData: Record<string, any> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if ('note' in updates) updateData.note = updates.note || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.section !== undefined) updateData.section = updates.section;
      if ('deadline' in updates) updateData.deadline = updates.deadline || null;
      if ('estimated_time' in updates) updateData.estimated_time = updates.estimated_time || null;
      if (updates.is_right_now !== undefined) updateData.is_right_now = updates.is_right_now;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if ('importance' in updates) updateData.importance = updates.importance || null;
      if ('urgency' in updates) updateData.urgency = updates.urgency || null;
      if ('project_id' in updates) updateData.project_id = updates.project_id || null;
      if ('completed_at' in updates) updateData.completed_at = updates.completed_at || null;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },

  /**
   * Delete a task from Supabase
   */
  async deleteTask(userId: string, taskId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },
};
