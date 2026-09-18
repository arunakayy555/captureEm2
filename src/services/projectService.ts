import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project, Milestone } from '../types';

/**
 * Transforms Supabase database row to client Project model
 */
const mapRowToProject = (row: any): Project => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  status: row.status as 'active' | 'shelf',
  milestones: (row.milestones as Milestone[]) || [],
  created_at: row.created_at,
});

/**
 * Transforms client Project model to Supabase database row format
 */
const mapProjectToRow = (userId: string, project: Project) => ({
  id: project.id,
  user_id: userId,
  title: project.title,
  description: project.description || '',
  status: project.status,
  milestones: project.milestones || [],
  created_at: project.created_at,
  updated_at: new Date().toISOString(),
});

export const projectService = {
  /**
   * Fetch all projects belonging to the authenticated user
   */
  async getProjects(userId: string): Promise<{ data: Project[] | null; error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []).map(mapRowToProject), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  },

  /**
   * Create a new project in Supabase
   */
  async createProject(userId: string, project: Project): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const row = mapProjectToRow(userId, project);
      const { error } = await supabase.from('projects').insert(row);
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
   * Update an existing project in Supabase
   */
  async updateProject(userId: string, projectId: string, updates: Partial<Project>): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.milestones !== undefined) updateData.milestones = updates.milestones;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
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
   * Delete a project from Supabase
   */
  async deleteProject(userId: string, projectId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
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
