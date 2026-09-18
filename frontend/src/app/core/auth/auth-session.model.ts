import { User } from '../models/user.model';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}
