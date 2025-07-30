// src/types/auth.d.ts
import "next-auth";

// Extendemos el tipo del token JWT
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    portalUrl?: string;
    error?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }
}

// Extendemos el tipo de la Sesión
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    portalUrl?: string;
    error?: string | undefined;
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }
}
