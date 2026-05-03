export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      context_items: {
        Row: {
          id: string;
          project_id: string;
          source: 'github' | 'slack' | 'jira' | 'linear' | 'manual';
          type: 'commit' | 'pr' | 'message' | 'issue' | 'decision' | 'architecture' | 'blocker';
          title: string;
          content: string;
          metadata: Json;
          embedding: number[] | null;
          created_at: string;
          indexed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          source: 'github' | 'slack' | 'jira' | 'linear' | 'manual';
          type: 'commit' | 'pr' | 'message' | 'issue' | 'decision' | 'architecture' | 'blocker';
          title: string;
          content: string;
          metadata?: Json;
          embedding?: number[] | null;
          created_at?: string;
          indexed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          source?: 'github' | 'slack' | 'jira' | 'linear' | 'manual';
          type?: 'commit' | 'pr' | 'message' | 'issue' | 'decision' | 'architecture' | 'blocker';
          title?: string;
          content?: string;
          metadata?: Json;
          embedding?: number[] | null;
          created_at?: string;
          indexed_at?: string | null;
        };
        Relationships: [];
      };
      integrations: {
        Row: {
          id: string;
          workspace_id: string;
          provider: 'github' | 'slack' | 'jira' | 'linear';
          config: Json;
          status: 'active' | 'paused' | 'error';
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider: 'github' | 'slack' | 'jira' | 'linear';
          config?: Json;
          status?: 'active' | 'paused' | 'error';
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: 'github' | 'slack' | 'jira' | 'linear';
          config?: Json;
          status?: 'active' | 'paused' | 'error';
          created_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      queries: {
        Row: {
          id: string;
          project_id: string | null;
          user_id: string | null;
          question: string;
          answer: string | null;
          context_used: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          question: string;
          answer?: string | null;
          context_used?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          question?: string;
          answer?: string | null;
          context_used?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: 'free' | 'pro' | 'team';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: 'free' | 'pro' | 'team';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: 'free' | 'pro' | 'team';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
