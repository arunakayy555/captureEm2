import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CalendarEvent, CalendarEventColor } from '../types';

/**
 * Transforms Supabase database row to client CalendarEvent model
 */
const mapRowToEvent = (row: any): CalendarEvent => ({
  id: row.id,
  title: row.title,
  date: row.date,
  start_time: row.start_time || undefined,
  end_time: row.end_time || undefined,
  notes: row.notes || undefined,
  color: (row.color as CalendarEventColor) || 'yellow',
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * Transforms client CalendarEvent model to Supabase database row format
 */
const mapEventToRow = (userId: string, event: CalendarEvent) => ({
  id: event.id,
  user_id: userId,
  title: event.title,
  date: event.date,
  start_time: event.start_time || null,
  end_time: event.end_time || null,
  notes: event.notes || null,
  color: event.color || 'yellow',
  created_at: event.created_at || new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const calendarEventService = {
  /**
   * Fetch all calendar events belonging to the authenticated user
   */
  async getEvents(userId: string): Promise<{ data: CalendarEvent[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true, nullsFirst: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToEvent), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create a new calendar event in Supabase
   */
  async createEvent(userId: string, event: CalendarEvent): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapEventToRow(userId, event);
      const { error } = await supabase.from('calendar_events').insert(row);
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
   * Update an existing calendar event in Supabase
   */
  async updateEvent(
    userId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.date !== undefined) updateData.date = updates.date;
      if ('start_time' in updates) updateData.start_time = updates.start_time || null;
      if ('end_time' in updates) updateData.end_time = updates.end_time || null;
      if ('notes' in updates) updateData.notes = updates.notes || null;
      if (updates.color !== undefined) updateData.color = updates.color;

      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId)
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
   * Delete a calendar event from Supabase
   */
  async deleteEvent(userId: string, eventId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
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