export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  identityNumber: string; // TC Kimlik
  dateOfBirth: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}