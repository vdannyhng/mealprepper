// Supabase types for the public schema (format of `supabase gen types typescript`).
// Regenerate after schema changes with `npm run db:types` (requires a running local Supabase).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          goal: Database["public"]["Enums"]["goal_type"] | null;
          sex: Database["public"]["Enums"]["sex_type"] | null;
          birth_year: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          activity_level: Database["public"]["Enums"]["activity_level"] | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          goal?: Database["public"]["Enums"]["goal_type"] | null;
          sex?: Database["public"]["Enums"]["sex_type"] | null;
          birth_year?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          activity_level?: Database["public"]["Enums"]["activity_level"] | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          goal?: Database["public"]["Enums"]["goal_type"] | null;
          sex?: Database["public"]["Enums"]["sex_type"] | null;
          birth_year?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          activity_level?: Database["public"]["Enums"]["activity_level"] | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      user_preferences: {
        Row: {
          user_id: string;
          diet_type: Database["public"]["Enums"]["diet_type"];
          variety_level: Database["public"]["Enums"]["variety_level"];
          meals_per_day: number;
          snacks_per_day: number;
          max_recipe_time: number | null;
          max_prep_time: number | null;
          weekly_budget: number | null;
          currency: string;
          prep_weekdays: number[];
          allergens: string[];
          tolerance_calories_pct: number;
          tolerance_protein_min_pct: number;
          tolerance_carbs_pct: number;
          tolerance_fat_pct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          diet_type?: Database["public"]["Enums"]["diet_type"];
          variety_level?: Database["public"]["Enums"]["variety_level"];
          meals_per_day?: number;
          snacks_per_day?: number;
          max_recipe_time?: number | null;
          max_prep_time?: number | null;
          weekly_budget?: number | null;
          currency?: string;
          prep_weekdays?: number[];
          allergens?: string[];
          tolerance_calories_pct?: number;
          tolerance_protein_min_pct?: number;
          tolerance_carbs_pct?: number;
          tolerance_fat_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          diet_type?: Database["public"]["Enums"]["diet_type"];
          variety_level?: Database["public"]["Enums"]["variety_level"];
          meals_per_day?: number;
          snacks_per_day?: number;
          max_recipe_time?: number | null;
          max_prep_time?: number | null;
          weekly_budget?: number | null;
          currency?: string;
          prep_weekdays?: number[];
          allergens?: string[];
          tolerance_calories_pct?: number;
          tolerance_protein_min_pct?: number;
          tolerance_carbs_pct?: number;
          tolerance_fat_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      macro_targets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber: number | null;
          sugar: number | null;
          salt: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber?: number | null;
          sugar?: number | null;
          salt?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          fiber?: number | null;
          sugar?: number | null;
          salt?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      day_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          macro_target_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          macro_target_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          macro_target_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "day_types_macro_target_id_fkey";
            columns: ["macro_target_id"];
            isOneToOne: false;
            referencedRelation: "macro_targets";
            referencedColumns: ["id"];
          },
        ];
      };
      food_items: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          brand: string | null;
          category: Database["public"]["Enums"]["food_category"];
          base_amount: number;
          base_unit: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber: number | null;
          sugar: number | null;
          salt: number | null;
          grams_per_piece: number | null;
          grams_per_serving: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          brand?: string | null;
          category?: Database["public"]["Enums"]["food_category"];
          base_amount?: number;
          base_unit?: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber?: number | null;
          sugar?: number | null;
          salt?: number | null;
          grams_per_piece?: number | null;
          grams_per_serving?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          brand?: string | null;
          category?: Database["public"]["Enums"]["food_category"];
          base_amount?: number;
          base_unit?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          fiber?: number | null;
          sugar?: number | null;
          salt?: number | null;
          grams_per_piece?: number | null;
          grams_per_serving?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      recipes: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          image_url: string | null;
          category: Database["public"]["Enums"]["recipe_category"];
          tags: string[];
          servings: number;
          prep_time: number;
          cook_time: number;
          total_time: number | null;
          fridge_life_days: number | null;
          freezer_life_days: number | null;
          storage_notes: string | null;
          instructions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          image_url?: string | null;
          category?: Database["public"]["Enums"]["recipe_category"];
          tags?: string[];
          servings: number;
          prep_time?: number;
          cook_time?: number;
          total_time?: never;
          fridge_life_days?: number | null;
          freezer_life_days?: number | null;
          storage_notes?: string | null;
          instructions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          category?: Database["public"]["Enums"]["recipe_category"];
          tags?: string[];
          servings?: number;
          prep_time?: number;
          cook_time?: number;
          total_time?: never;
          fridge_life_days?: number | null;
          freezer_life_days?: number | null;
          storage_notes?: string | null;
          instructions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          food_item_id: string;
          amount: number;
          unit: Database["public"]["Enums"]["food_unit"];
          note: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          food_item_id: string;
          amount: number;
          unit: Database["public"]["Enums"]["food_unit"];
          note?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          food_item_id?: string;
          amount?: number;
          unit?: Database["public"]["Enums"]["food_unit"];
          note?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_plans: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      planned_meals: {
        Row: {
          id: string;
          weekly_plan_id: string;
          date: string;
          meal_type: Database["public"]["Enums"]["meal_slot"];
          recipe_id: string;
          servings: number;
          status: Database["public"]["Enums"]["meal_status"];
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          weekly_plan_id: string;
          date: string;
          meal_type: Database["public"]["Enums"]["meal_slot"];
          recipe_id: string;
          servings?: number;
          status?: Database["public"]["Enums"]["meal_status"];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          weekly_plan_id?: string;
          date?: string;
          meal_type?: Database["public"]["Enums"]["meal_slot"];
          recipe_id?: string;
          servings?: number;
          status?: Database["public"]["Enums"]["meal_status"];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_meals_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planned_meals_weekly_plan_id_fkey";
            columns: ["weekly_plan_id"];
            isOneToOne: false;
            referencedRelation: "weekly_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_prep_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          status: Database["public"]["Enums"]["prep_session_status"];
          started_at: string | null;
          completed_at: string | null;
          planned_portions: number | null;
          completed_portions: number | null;
          covers_to: string | null;
          estimated_minutes: number | null;
          duration_minutes: number | null;
          notes: string | null;
          proof_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          status?: Database["public"]["Enums"]["prep_session_status"];
          started_at?: string | null;
          completed_at?: string | null;
          planned_portions?: number | null;
          completed_portions?: number | null;
          covers_to?: string | null;
          estimated_minutes?: number | null;
          duration_minutes?: number | null;
          notes?: string | null;
          proof_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          status?: Database["public"]["Enums"]["prep_session_status"];
          started_at?: string | null;
          completed_at?: string | null;
          planned_portions?: number | null;
          completed_portions?: number | null;
          covers_to?: string | null;
          estimated_minutes?: number | null;
          duration_minutes?: number | null;
          notes?: string | null;
          proof_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      meal_prep_session_recipes: {
        Row: {
          id: string;
          session_id: string;
          recipe_id: string;
          servings: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          recipe_id: string;
          servings: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          recipe_id?: string;
          servings?: number;
        };
        Relationships: [
          {
            foreignKeyName: "meal_prep_session_recipes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_prep_session_recipes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "meal_prep_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_prep_tasks: {
        Row: {
          id: string;
          session_id: string;
          recipe_id: string | null;
          title: string;
          sort_order: number;
          duration_minutes: number | null;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          recipe_id?: string | null;
          title: string;
          sort_order?: number;
          duration_minutes?: number | null;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          recipe_id?: string | null;
          title?: string;
          sort_order?: number;
          duration_minutes?: number | null;
          completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meal_prep_tasks_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_prep_tasks_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "meal_prep_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      pantry_items: {
        Row: {
          id: string;
          user_id: string;
          food_item_id: string;
          amount: number;
          unit: Database["public"]["Enums"]["food_unit"];
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_item_id: string;
          amount: number;
          unit: Database["public"]["Enums"]["food_unit"];
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_item_id?: string;
          amount?: number;
          unit?: Database["public"]["Enums"]["food_unit"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pantry_items_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      shopping_list_items: {
        Row: {
          id: string;
          shopping_list_id: string;
          food_item_id: string | null;
          custom_name: string | null;
          category: Database["public"]["Enums"]["food_category"];
          amount: number | null;
          unit: Database["public"]["Enums"]["food_unit"] | null;
          checked: boolean;
          is_manual: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          shopping_list_id: string;
          food_item_id?: string | null;
          custom_name?: string | null;
          category?: Database["public"]["Enums"]["food_category"];
          amount?: number | null;
          unit?: Database["public"]["Enums"]["food_unit"] | null;
          checked?: boolean;
          is_manual?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          shopping_list_id?: string;
          food_item_id?: string | null;
          custom_name?: string | null;
          category?: Database["public"]["Enums"]["food_category"];
          amount?: number | null;
          unit?: Database["public"]["Enums"]["food_unit"] | null;
          checked?: boolean;
          is_manual?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey";
            columns: ["shopping_list_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      nutrition_day_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          completed: boolean;
          target_met: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          completed?: boolean;
          target_met?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          completed?: boolean;
          target_met?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      excluded_foods: {
        Row: {
          id: string;
          user_id: string;
          food_item_id: string | null;
          custom_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_item_id?: string | null;
          custom_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_item_id?: string | null;
          custom_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "excluded_foods_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
      food_preferences: {
        Row: {
          id: string;
          user_id: string;
          kind: Database["public"]["Enums"]["food_preference_kind"];
          food_item_id: string | null;
          custom_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: Database["public"]["Enums"]["food_preference_kind"];
          food_item_id?: string | null;
          custom_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: Database["public"]["Enums"]["food_preference_kind"];
          food_item_id?: string | null;
          custom_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "food_preferences_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_own_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_prep_session: {
        Args: {
          p_date: string;
          p_covers_to: string;
          p_recipes: Json;
          p_tasks: Json;
          p_estimated_minutes: number;
        };
        Returns: string;
      };
      complete_prep_session: {
        Args: {
          p_session_id: string;
          p_completed_portions: number;
          p_duration_minutes: number | null;
          p_notes: string | null;
          p_photo_path: string | null;
        };
        Returns: undefined;
      };
      copy_planned_day: {
        Args: { p_week_start: string; p_from: string; p_to: string[]; p_replace?: boolean };
        Returns: number;
      };
      save_recipe: {
        Args: { p_recipe: Json; p_ingredients: Json; p_recipe_id?: string };
        Returns: string;
      };
      complete_onboarding: {
        Args: {
          p_goal: Database["public"]["Enums"]["goal_type"];
          p_calories: number;
          p_protein: number;
          p_carbs: number;
          p_fat: number;
          p_fiber: number | null;
          p_diet_type: Database["public"]["Enums"]["diet_type"];
          p_prep_weekdays: number[];
          p_meals_per_day: number;
          p_snacks_per_day: number;
          p_variety_level: Database["public"]["Enums"]["variety_level"];
          p_allergens: string[];
          p_excluded_foods: string[];
          p_liked_foods: string[];
          p_disliked_foods: string[];
          p_sex?: Database["public"]["Enums"]["sex_type"] | null;
          p_birth_year?: number | null;
          p_weight_kg?: number | null;
          p_height_cm?: number | null;
          p_activity_level?: Database["public"]["Enums"]["activity_level"] | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
      diet_type: "omnivore" | "vegetarian" | "vegan" | "pescatarian";
      food_category: "protein" | "carbs" | "vegetables" | "fruit" | "dairy" | "fats" | "spices" | "sauces" | "other";
      food_preference_kind: "like" | "dislike";
      food_unit: "g" | "kg" | "ml" | "l" | "piece" | "tbsp" | "tsp" | "serving";
      goal_type: "fat_loss" | "maintenance" | "muscle_gain";
      meal_slot: "breakfast" | "snack_1" | "lunch" | "snack_2" | "dinner";
      meal_status: "planned" | "prepared" | "eaten" | "skipped" | "replaced";
      prep_session_status: "planned" | "in_progress" | "completed" | "cancelled";
      recipe_category: "breakfast" | "lunch" | "dinner" | "snack";
      sex_type: "female" | "male" | "diverse";
      variety_level: "low" | "medium" | "high";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];

export const Constants = {
  public: {
    Enums: {
      activity_level: ["sedentary", "light", "moderate", "active", "very_active"],
      diet_type: ["omnivore", "vegetarian", "vegan", "pescatarian"],
      food_category: ["protein", "carbs", "vegetables", "fruit", "dairy", "fats", "spices", "sauces", "other"],
      food_preference_kind: ["like", "dislike"],
      food_unit: ["g", "kg", "ml", "l", "piece", "tbsp", "tsp", "serving"],
      goal_type: ["fat_loss", "maintenance", "muscle_gain"],
      meal_slot: ["breakfast", "snack_1", "lunch", "snack_2", "dinner"],
      meal_status: ["planned", "prepared", "eaten", "skipped", "replaced"],
      prep_session_status: ["planned", "in_progress", "completed", "cancelled"],
      recipe_category: ["breakfast", "lunch", "dinner", "snack"],
      sex_type: ["female", "male", "diverse"],
      variety_level: ["low", "medium", "high"],
    },
  },
} as const;
