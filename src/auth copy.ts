// src/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// authConfig contiene la configuración de nuestro proveedor de Bitrix24
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Aquí, en el futuro, añadiremos los 'callbacks' para interactuar
  // con la base de datos, que no son compatibles con el Edge.
});
