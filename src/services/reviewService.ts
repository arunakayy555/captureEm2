import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WeekReview } from '../types';

/**
 * Transforms Supabase database row to client WeekReview model
 */
const mapRowToReview = (row: any): WeekReview => ({
  id: row.id,
  week: row.week || 'This Week',
  date: row.date || row.created_at,
  completed: row.completed || {
    focusSessions: 0,
    focusHours: 0,
    tasksCount: 0,
    projectsCount: 0,
  },
  made: row.made || '',
  learned: row.learned || '',
  for_fun: row.for_fun || '',
  next_focus: row.next_focus || '',
});

/**
 * Transforms client WeekReview model to Supabase database row format
 */
const mapReviewToRow = (userId: string, review: WeekReview) => ({
  id: review.id,
  user_id: userId,
  week: review.week || 'This Week',
  date: review.date || new Date().toISOString(),
  completed: review.completed || {},
  made: review.made || '',
  learned: review.learned || '',
  for_fun: review.for_fun || '',
  next_focus: review.next_focus || '',
  created_at: review.date || new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const reviewService = {
  /**
   * Fetch all weekly reviews belonging to the authenticated user
   */
  async getReviews(userId: string): Promise<{ data: WeekReview[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToReview), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create or update a weekly review in Supabase
   */
  async saveReview(userId: string, review: WeekReview): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapReviewToRow(userId, review);
      const { error } = await supabase
        .from('weekly_reviews')
        .upsert(row, { onConflict: 'id' });

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
