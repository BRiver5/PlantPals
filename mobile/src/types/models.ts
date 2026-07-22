/** Shared data shapes mirroring the FastAPI response schemas. */

export interface Plant {
  id: number;
  name: string;
  species: string | null;
  photo_url: string | null;
  interval_days: number;
  water_amount_ml: number | null;
  location: string | null;
  care_notes: string | null;
  created_at: string;
  last_watered_at: string | null;
  next_due_at: string;
}

export interface WateringLog {
  id: number;
  plant_id: number;
  watered_at: string;
}

export interface PlantDetail extends Plant {
  logs: WateringLog[];
}

export interface PlantSpecies {
  id: number;
  common_name: string;
  scientific_name: string | null;
  default_interval_days: number;
  default_water_amount_ml: number;
  light: string;
  difficulty: string;
  care_tip: string;
}

export interface WeeklyBucket {
  week_start: string;
  label: string;
  count: number;
}

export interface Stats {
  total_plants: number;
  waterings_this_month: number;
  waterings_total: number;
  due_today: number;
  overdue: number;
  current_streak: number;
  best_streak: number;
  weekly: WeeklyBucket[];
}

export interface PlantInput {
  name: string;
  species?: string | null;
  photo_url?: string | null;
  interval_days: number;
  water_amount_ml?: number | null;
  location?: string | null;
  care_notes?: string | null;
  last_watered_at?: string | null;
}
