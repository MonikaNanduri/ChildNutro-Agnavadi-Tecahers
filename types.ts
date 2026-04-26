export interface User {
  id: number;
  username: string;
  name: string;
}

export interface Child {
  id: number;
  name: string;
  age: number;
  gender: string;
  parent_name: string;
  contact: string;
  worker_id: number;
  bmi?: number;
  status?: string;
  height?: number;
  weight?: number;
  recorded_at?: string;
}

export interface NutritionRecord {
  id: number;
  child_id: number;
  height: number;
  weight: number;
  bmi: number;
  status: string;
  recorded_at: string;
}

export interface DashboardStats {
  total: number;
  healthy: number;
  moderate: number;
  severe: number;
}
