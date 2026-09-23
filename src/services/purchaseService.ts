import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PurchaseItem } from '../types';

/**
 * Transforms Supabase database row to client PurchaseItem model
 */
const mapRowToPurchase = (row: any): PurchaseItem => ({
  id: row.id,
  name: row.name,
  notes: row.notes || undefined,
  status: row.status || 'active',
  created_at: row.created_at,
  purchased_at: row.purchased_at || undefined,
  discarded_at: row.discarded_at || undefined,
  updated_at: row.updated_at,
});

/**
 * Transforms client PurchaseItem model to Supabase database row format
 */
const mapPurchaseToRow = (userId: string, item: PurchaseItem) => {
  const row: Record<string, any> = {
    id: item.id,
    user_id: userId,
    name: item.name,
    notes: item.notes || null,
    status: item.status,
    created_at: item.created_at || new Date().toISOString(),
    purchased_at: item.purchased_at || null,
    updated_at: item.updated_at || new Date().toISOString(),
  };

  // Only include discarded_at if present
  if (item.discarded_at !== undefined) {
    row.discarded_at = item.discarded_at;
  }

  return row;
};

export const purchaseService = {
  /**
   * Fetch all purchase items for authenticated user (newest first)
   */
  async getPurchases(userId: string): Promise<{ data: PurchaseItem[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToPurchase), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create a new purchase item in Supabase
   */
  async createPurchase(userId: string, item: PurchaseItem): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapPurchaseToRow(userId, item);
      const { error } = await supabase.from('purchase_items').insert(row);
      if (error) {
        // Fallback: If discarded_at column does not exist on table, retry without it
        if (error.message?.includes('discarded_at') || (error as any).code === '42703') {
          const { discarded_at, ...cleanRow } = row;
          const retry = await supabase.from('purchase_items').insert(cleanRow);
          if (!retry.error) return { error: null };
        }
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },

  /**
   * Update an existing purchase item in Supabase (strictly preserving created_at)
   */
  async updatePurchase(
    userId: string,
    itemId: string,
    updates: Partial<PurchaseItem>
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if ('purchased_at' in updates) updateData.purchased_at = updates.purchased_at || null;
      if ('discarded_at' in updates && updates.discarded_at !== undefined) {
        updateData.discarded_at = updates.discarded_at || null;
      }

      const { error } = await supabase
        .from('purchase_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) {
        // Fallback: If discarded_at column does not exist on table, retry without it
        if (error.message?.includes('discarded_at') || (error as any).code === '42703') {
          delete updateData.discarded_at;
          const retry = await supabase
            .from('purchase_items')
            .update(updateData)
            .eq('id', itemId)
            .eq('user_id', userId);
          if (!retry.error) return { error: null };
        }
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },

  /**
   * Delete a purchase item from Supabase
   */
  async deletePurchase(userId: string, itemId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('purchase_items')
        .delete()
        .eq('id', itemId)
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
