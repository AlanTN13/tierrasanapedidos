export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          image_path: string | null;
          search_tags: string[] | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          image_path?: string | null;
          search_tags?: string[] | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          image_path?: string | null;
          search_tags?: string[] | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      product_presentations: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          price_cents: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          price_cents: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          label?: string;
          price_cents?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image_path: string | null;
          tags: string[] | null;
          is_featured: boolean;
          featured_order: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          image_path?: string | null;
          tags?: string[] | null;
          is_featured?: boolean;
          featured_order?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          image_path?: string | null;
          tags?: string[] | null;
          is_featured?: boolean;
          featured_order?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
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
