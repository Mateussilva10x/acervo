/**
 * Tipos de autenticação.
 * User agora espelha o UserResponseDTO do backend.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  birthDate: string; // "YYYY-MM-DD"
  role?: string;
  planType?: "FREE" | "PRO";
  firstLogin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
