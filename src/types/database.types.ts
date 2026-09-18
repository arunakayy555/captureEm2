export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          theme: 'night' | 'light';
          focus_duration: number;
          sound_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          theme?: 'night' | 'light';
          focus_duration?: number;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme?: 'night' | 'light';
          focus_duration?: number;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          status: 'active' | 'shelf';
          milestones: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          status?: 'active' | 'shelf';
          milestones?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          status?: 'active' | 'shelf';
          milestones?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          note: string | null;
          status: 'active' | 'completed';
          section: 'now' | 'next' | 'later';
          deadline: string | null;
          estimated_time: string | null;
          is_right_now: boolean;
          importance: 'Important' | 'Not Important' | null;
          urgency: 'Urgent' | 'Not Urgent' | null;
          tags: string[];
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          note?: string | null;
          status?: 'active' | 'completed';
          section?: 'now' | 'next' | 'later';
          deadline?: string | null;
          estimated_time?: string | null;
          is_right_now?: boolean;
          importance?: 'Important' | 'Not Important' | null;
          urgency?: 'Urgent' | 'Not Urgent' | null;
          tags?: string[];
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          title?: string;
          note?: string | null;
          status?: 'active' | 'completed';
          section?: 'now' | 'next' | 'later';
          deadline?: string | null;
          estimated_time?: string | null;
          is_right_now?: boolean;
          importance?: 'Important' | 'Not Important' | null;
          urgency?: 'Urgent' | 'Not Urgent' | null;
          tags?: string[];
          created_at?: string;
          completed_at?: string | null;
        };
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          project_id: string | null;
          task_title: string;
          duration: number;
          completed: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          task_id?: string | null;
          project_id?: string | null;
          task_title: string;
          duration: number;
          completed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          project_id?: string | null;
          task_title?: string;
          duration?: number;
          completed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
      };
      for_fun_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          duration: string | null;
          created_at: string;
          last_enjoyed: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          duration?: string | null;
          created_at?: string;
          last_enjoyed?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          duration?: string | null;
          created_at?: string;
          last_enjoyed?: string | null;
        };
      };
      body_wellness: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          energy: number;
          sleep: 'Good' | 'Okay' | 'Needs care';
          movement: 'Done' | 'Planned';
          water: 'Good' | 'More';
          tasks: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          date?: string;
          energy?: number;
          sleep?: 'Good' | 'Okay' | 'Needs care';
          movement?: 'Done' | 'Planned';
          water?: 'Good' | 'More';
          tasks?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          energy?: number;
          sleep?: 'Good' | 'Okay' | 'Needs care';
          movement?: 'Done' | 'Planned';
          water?: 'Good' | 'More';
          tasks?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week: string;
          date: string;
          completed: Json;
          made: string;
          learned: string;
          for_fun: string;
          next_focus: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          week: string;
          date?: string;
          completed?: Json;
          made?: string;
          learned?: string;
          for_fun?: string;
          next_focus?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week?: string;
          date?: string;
          completed?: Json;
          made?: string;
          learned?: string;
          for_fun?: string;
          next_focus?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
