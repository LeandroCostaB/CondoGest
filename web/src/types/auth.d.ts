export interface LoginCredentials {
  email: string;
  senha: string;
}

export type UserRole = "SINDICO" | "MORADOR";

export interface AuthUser {
  id: string;
  nome: string;
  role: UserRole;
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export type CondominiumStatus = "active" | "inactive";

export interface Condominium {
  id: string;
  name: string;
  address: string;
  userId: string;
  status: CondominiumStatus;
}
