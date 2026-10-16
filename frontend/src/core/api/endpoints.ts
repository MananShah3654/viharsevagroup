// API functions grouped by domain. All go through apiRequest (production API).

import { apiRequest } from "@/src/core/api/client";
import type {
  AuthResponse,
  Participation,
  ReportSummary,
  User,
  Vihar,
} from "@/src/shared/models";

// ---- Auth ----
export function login(phone: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { phone, password },
  });
}

export function register(payload: {
  phone: string;
  password: string;
  name: string;
  area: string;
  blood_group: string;
  emergency_contact: string;
  date_of_birth: string;
}) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });
}

export function getMe() {
  return apiRequest<User>("/users/me");
}

export function updateMe(payload: Partial<User>) {
  return apiRequest<User>("/users/me", { method: "PUT", body: payload });
}

export function changePassword(old_password: string, new_password: string) {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: { old_password, new_password },
  });
}

// ---- Vihars ----
export function listVihars() {
  return apiRequest<Vihar[]>("/vihars");
}

export function getVihar(id: string) {
  return apiRequest<Vihar>(`/vihars/${id}`);
}

export function getMyVihars() {
  return apiRequest<Vihar[]>("/vihars/user/my-vihars");
}

export function participate(vihar_id: string, status: "in" | "out") {
  return apiRequest<{ status: string; message: string }>(
    `/vihars/${vihar_id}/participate`,
    { method: "POST", body: { vihar_id, status } },
  );
}

export function getReport(period: "weekly" | "monthly" | "yearly", userId?: string) {
  const q = userId ? `&user_id=${userId}` : "";
  return apiRequest<ReportSummary>(`/reports/summary?period=${period}${q}`);
}

// ---- Admin ----
export function nextRouteNumber(viharDate?: string) {
  const q = viharDate ? `?vihar_date=${encodeURIComponent(viharDate)}` : "";
  return apiRequest<{ next_route_number: string; next_total_number: string }>(`/vihars/next-route-number${q}`);
}

export function createVihar(payload: Partial<Vihar>) {
  return apiRequest<Vihar>("/vihars", { method: "POST", body: payload });
}

export function updateVihar(id: string, payload: Partial<Vihar>) {
  return apiRequest<Vihar>(`/vihars/${id}`, { method: "PUT", body: payload });
}

export function deleteVihar(id: string) {
  return apiRequest<{ status: string }>(`/vihars/${id}`, { method: "DELETE" });
}

export interface ParticipantsResponse {
  vihar_id: string;
  total_participants: number;
  opted_in: number;
  opted_out: number;
  participants: Participation[];
}

export function getParticipants(vihar_id: string) {
  return apiRequest<ParticipantsResponse>(`/vihars/${vihar_id}/participants`);
}

export function listUsers() {
  return apiRequest<User[]>("/admin/users");
}

export function assignUsers(vihar_id: string, user_ids: string[], status: "in" | "out" = "in") {
  return apiRequest<{ status: string; assigned_count: number }>(
    `/vihars/${vihar_id}/assign-users`,
    { method: "POST", body: { user_ids, status } },
  );
}

export function removeParticipant(vihar_id: string, participation_id: string) {
  return apiRequest<{ status: string }>(
    `/vihars/${vihar_id}/participants/${participation_id}`,
    { method: "DELETE" },
  );
}

export interface AdminUserPayload {
  phone: string;
  name: string;
  password?: string;
  area: string;
  blood_group: string;
  emergency_contact: string;
  date_of_birth: string;
  age?: number;
  address?: string;
  car?: boolean;
  photo?: string;
}

export function createUser(payload: AdminUserPayload) {
  return apiRequest<User>("/admin/users", { method: "POST", body: payload });
}

export function updateUser(id: string, payload: Partial<AdminUserPayload>) {
  return apiRequest<User>(`/admin/users/${id}`, { method: "PUT", body: payload });
}

export function deleteUser(id: string) {
  return apiRequest<{ status: string }>(`/admin/users/${id}`, { method: "DELETE" });
}

export function setUserRole(phone: string, role: "admin" | "user") {
  return apiRequest<{ status: string; message?: string }>("/admin/users/role", {
    method: "PUT",
    body: { phone, role },
  });
}
