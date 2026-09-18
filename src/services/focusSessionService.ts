import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FocusSession } from '../types';

/**
 * Transforms Supabase database row to client FocusSession model
 */
const mapRowToSession = (row: any): FocusSession => ({
  id: row.id,
  task: row.task_title,
  task_id: row.task_id || undefined,
  project_id: row.project_id || undefined,
  duration: row.duration,
  completed: Boolean(row.completed),
  date: row.created_at,
  created_at: row.created_at,
  notes: row.notes || undefined,
});

/**
 * Transforms client FocusSession model to Supabase database row format
 */
const mapSessionToRow = (userId: string, session: FocusSession) => ({
  id: session.id,
  user_id: userId,
  task_id: session.task_id || null,
  project_id: session.project_id || null,
  task_title: session.task || 'Focus session',
  duration: session.duration,
  completed: session.completed ?? true,
  notes: session.notes || null,
  created_at: session.date || session.created_at || new Date().toISOString(),
});

export const focusSessionService = {
  /**
   * Fetch all focus sessions belonging to the authenticated user
   */
  async getFocusSessions(userId: string): Promise<{ data: FocusSession[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToSession), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create a new focus session in Supabase
   */
  async createFocusSession(userId: string, session: FocusSession): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapSessionToRow(userId, session);
      const { error } = await supabase.from('focus_sessions').insert(row);
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
   * Delete a focus session from Supabase
   */
  async deleteFocusSession(userId: string, sessionId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('focus_sessions')
        .delete()
        .eq('id', sessionId)
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
