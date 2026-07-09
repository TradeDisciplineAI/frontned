/**
 * Authentication Typings
 * Generated based on OpenAPI 3.1.0 specifications.
 */

export interface Token {
  access_token: string;
  token_type: string; // usually "bearer"
}

export type UserRole = 'admin' | 'user';

export interface UserResponse {
  id: string; // uuid
  username: string;
  email: string; // email format
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string; // date-time string
  updated_at: string; // date-time string
}

export interface UserSessionResponse {
  id: string; // uuid
  device_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // date-time
  last_used_at: string | null; // date-time
  is_current: boolean;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: any;
  ctx?: Record<string, any>;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}
