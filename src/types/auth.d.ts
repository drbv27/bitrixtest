// src/types/auth.d.ts
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

/**
 * Extiende los tipos de NextAuth para incluir nuestras propiedades personalizadas.
 */

// El objeto Account que recibimos del proveedor
declare module "next-auth" {
  interface Account {
    client_endpoint?: string;
  }

  // El objeto Session que usamos en la aplicación
  interface Session {
    accessToken?: string;
    portalUrl?: string;
    error?: string;
    // Extendemos el usuario de la sesión para incluir nuestro 'id' obligatorio
    user?: {
      id: string;
    } & DefaultSession["user"]; // Hereda name, email, image del tipo por defecto
  }
}

// El token JWT que se maneja internamente
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    portalUrl?: string;
    // El usuario dentro del token también necesita el id
    user?: {
      id: string;
    } & DefaultSession["user"];
  }
}
