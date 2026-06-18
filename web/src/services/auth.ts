import {
  clearToken,
  coreApi,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/lib/api";
import type {
  AuthUser,
  Condominium,
  LoginCredentials,
  LoginResponse,
} from "@/types/auth";
import type { PaginatedResult } from "@/types/report";

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await coreApi.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  setToken(response.access_token);
  setStoredUser(response.user);
  return response.user;
}

export async function getMe(): Promise<AuthUser> {
  return coreApi.get<AuthUser>("/auth/me");
}

export function logout(): void {
  clearToken();
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser<AuthUser>();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export async function listCondominiums(): Promise<Condominium[]> {
  const response = await coreApi.get<PaginatedResult<Condominium>>(
    "/condominiums?page=1&limit=100",
  );
  return response.data;
}
