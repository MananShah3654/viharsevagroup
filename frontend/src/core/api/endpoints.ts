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

export function getReport(period: "weekly" | "monthly" | "yearly") {
  return apiRequest<ReportSummary>(`/reports/summary?period=${period}`);
}

// ---- Admin ----
export function nextRouteNumber() {
  return apiRequest<{ next_route_number: string }>("/vihars/next-route-number");
}

export function createVihar(payload: Partial<Vihar>) {
  return apiRequest<Vihar>("/vihars", { method: "POST", body: payload });
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
