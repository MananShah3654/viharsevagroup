// Shared data models, mirroring the production backend shapes.

export type Role = "admin" | "user";

export interface User {
  id: string;
  phone: string;
  name?: string;
  photo?: string;
  age?: number;
  area?: string;
  address?: string;
  car?: boolean;
  blood_group?: string;
  emergency_contact?: string;
  date_of_birth?: string;
  role: Role;
  created_at?: string;
}

export interface Vihar {
  id: string;
  route_no: string;
  gujarati_date?: string;
  sahebji_name?: string;
  vihar_date: string; // dd/mm/yy
  vihar_time: string; // e.g. "5:30"
  sadhu_bhagvant: number;
  sadhviji_bhagvant: number;
  mumukshu: number;
  wheelchair: number;
  self?: boolean;
  luggage?: boolean;
  dori?: boolean;
  car_required?: boolean;
  activa?: boolean;
  from_upashray: string;
  to_upashray: string;
  approx_kms: number;
  created_at?: string;
  // Added by API / app:
  user_status?: "in" | "out" | null;
  participants?: Participation[];
}

export interface Participation {
  id?: string;
  participation_id?: string;
  vihar_id: string;
  user_id: string;
  status: "in" | "out";
  created_at?: string;
  user?: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ReportSummary {
  period: string;
  total_vihars: number;
  total_kms: number;
  total_sadhu_bhagvant: number;
  total_sadhviji_bhagvant: number;
  total_mumukshu: number;
  total_thana: number;
  vihars: Vihar[];
}
