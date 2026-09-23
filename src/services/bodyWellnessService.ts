import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BodyWellness, SleepQuality, MovementStatus, WaterStatus, BodyTask } from '../types';

/**
 * Transforms Supabase database row to client BodyWellness model
 */
const mapRowToWellness = (row: any): BodyWellness => ({
  id: row.id,
  date: row.date,
  energy: typeof row.energy === 'number' ? row.energy : 7,
  sleep: (row.sleep as SleepQuality) || 'Good',
  movement: (row.movement as MovementStatus) || 'Planned',
  water: (row.water as WaterStatus) || 'Good',
  tasks: Array.isArray(row.tasks) ? (row.tasks as BodyTask[]) : [],
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * Transforms client BodyWellness model to Supabase database row format
 */
const mapWellnessToRow = (userId: string, entry: BodyWellness) => ({
  id: entry.id || ('bw-' + entry.date + '-' + userId.substring(0, 8)),
  user_id: userId,
  date: entry.date,
  energy: entry.energy,
  sleep: entry.sleep,
  movement: entry.movement,
  water: entry.water,
  tasks: entry.tasks || [],
  created_at: entry.created_at || new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const bodyWellnessService = {
  /**
   * Fetch all body wellness entries belonging to the authenticated user
   */
  async getWellnessEntries(userId: string): Promise<{ data: BodyWellness[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('body_wellness')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToWellness), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create or update a body wellness entry in Supabase
   */
  async saveWellnessEntry(userId: string, entry: BodyWellness): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapWellnessToRow(userId, entry);
      const { error } = await supabase
        .from('body_wellness')
        .upsert(row, { onConflict: 'user_id,date' });

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
   * Delete a body wellness entry from Supabase
   */
  async deleteWellnessEntry(userId: string, date: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('body_wellness')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

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
