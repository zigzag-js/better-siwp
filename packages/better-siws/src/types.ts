// Type definitions for Better Auth internals
export interface BetterAuthUser {
  id: string;
  email: string;
  emailVerified: boolean | Date | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export interface BetterAuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}