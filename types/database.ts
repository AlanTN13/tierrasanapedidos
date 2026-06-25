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
      home_settings: {
        Row: {
          id: string;
          hero_banner_path: string | null;
          hero_banner_alt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hero_banner_path?: string | null;
          hero_banner_alt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hero_banner_path?: string | null;
          hero_banner_alt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_products: {
        Row: {
          recipe_id: string;
          product_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          recipe_id: string;
          product_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          recipe_id?: string;
          product_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string;
          long_description: string;
          hero_image_path: string;
          target_category: string;
          prep_label: string;
          servings_label: string;
          ingredients: string[];
          steps: string[];
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_description: string;
          long_description: string;
          hero_image_path: string;
          target_category: string;
          prep_label: string;
          servings_label: string;
          ingredients?: string[];
          steps?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          short_description?: string;
          long_description?: string;
          hero_image_path?: string;
          target_category?: string;
          prep_label?: string;
          servings_label?: string;
          ingredients?: string[];
          steps?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          product_presentation_id: string;
          base_sku_snapshot: string | null;
          presentation_sku_snapshot: string | null;
          amount_in_base_units_snapshot: string | null;
          quantity: string;
          unit_cost_cents: number;
          line_total_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_order_id: string;
          product_presentation_id: string;
          base_sku_snapshot?: string | null;
          presentation_sku_snapshot?: string | null;
          amount_in_base_units_snapshot?: string | number | null;
          quantity: string;
          unit_cost_cents: number;
          line_total_cents: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_order_id?: string;
          product_presentation_id?: string;
          base_sku_snapshot?: string | null;
          presentation_sku_snapshot?: string | null;
          amount_in_base_units_snapshot?: string | number | null;
          quantity?: string;
          unit_cost_cents?: number;
          line_total_cents?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          id: string;
          supplier_name: string;
          reference_number: string | null;
          purchased_at: string;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_name: string;
          reference_number?: string | null;
          purchased_at?: string;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_name?: string;
          reference_number?: string | null;
          purchased_at?: string;
          notes?: string | null;
          created_by?: string;
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
          sku: string | null;
          label: string;
          measurement_kind: string;
          amount_value: string;
          amount_unit: string;
          amount_in_base_units: string;
          price_cents: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku?: string | null;
          label: string;
          measurement_kind?: string;
          amount_value?: string | number;
          amount_unit?: string;
          amount_in_base_units?: string | number;
          price_cents: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string | null;
          label?: string;
          measurement_kind?: string;
          amount_value?: string | number;
          amount_unit?: string;
          amount_in_base_units?: string | number;
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
          base_sku: string | null;
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
          base_sku?: string | null;
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
          base_sku?: string | null;
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
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_presentation_id: string;
          base_sku_snapshot: string | null;
          presentation_sku_snapshot: string | null;
          amount_in_base_units_snapshot: string | null;
          quantity: string;
          unit_price_cents: number;
          unit_cost_snapshot_cents: number;
          line_total_cents: number;
          line_margin_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_presentation_id: string;
          base_sku_snapshot?: string | null;
          presentation_sku_snapshot?: string | null;
          amount_in_base_units_snapshot?: string | number | null;
          quantity: string;
          unit_price_cents: number;
          unit_cost_snapshot_cents: number;
          line_total_cents: number;
          line_margin_cents: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_presentation_id?: string;
          base_sku_snapshot?: string | null;
          presentation_sku_snapshot?: string | null;
          amount_in_base_units_snapshot?: string | number | null;
          quantity?: string;
          unit_price_cents?: number;
          unit_cost_snapshot_cents?: number;
          line_total_cents?: number;
          line_margin_cents?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          sale_number: number | null;
          sold_at: string;
          channel: string;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sale_number?: number | null;
          sold_at?: string;
          channel?: string;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sale_number?: number | null;
          sold_at?: string;
          channel?: string;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          presentation_id: string | null;
          movement_type: string;
          quantity: string;
          quantity_base_units: string;
          previous_stock: string;
          new_stock: string;
          reason: string;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          presentation_id?: string | null;
          movement_type: string;
          quantity: string | number;
          quantity_base_units: string | number;
          previous_stock: string | number;
          new_stock: string | number;
          reason: string;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          presentation_id?: string | null;
          movement_type?: string;
          quantity?: string | number;
          quantity_base_units?: string | number;
          previous_stock?: string | number;
          new_stock?: string | number;
          reason?: string;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      inventory_summary_by_presentation: {
        Row: {
          product_presentation_id: string;
          quantity_purchased: string;
          quantity_sold: string;
          stock_current: string;
          last_unit_cost_cents: number | null;
          revenue_cents: number;
          cost_cents: number;
          margin_cents: number;
        };
        Insert: {
          product_presentation_id?: string;
          quantity_purchased?: string;
          quantity_sold?: string;
          stock_current?: string;
          last_unit_cost_cents?: number | null;
          revenue_cents?: number;
          cost_cents?: number;
          margin_cents?: number;
        };
        Update: {
          product_presentation_id?: string;
          quantity_purchased?: string;
          quantity_sold?: string;
          stock_current?: string;
          last_unit_cost_cents?: number | null;
          revenue_cents?: number;
          cost_cents?: number;
          margin_cents?: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
