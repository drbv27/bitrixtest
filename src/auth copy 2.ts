// src/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    // El callback 'jwt' se ejecuta cada vez que se crea o actualiza un JSON Web Token.
    async jwt({ token, account, user }) {
      // En el inicio de sesión inicial, 'account' y 'user' están disponibles
      if (account && user) {
        // Guardamos los datos que necesitaremos para las llamadas a la API
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires =
          Date.now() + (account.expires_in as number) * 1000;

        // 'client_endpoint' nos da la URL base del portal para las llamadas a la API
        token.portalUrl = (account as any).client_endpoint;
        token.user = user; // Guardamos los datos del usuario en el token
        return token;
      }

      // En peticiones posteriores, devolvemos el token si no ha expirado
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Si el token ha expirado, en el futuro aquí implementaremos la lógica para refrescarlo.
      // Por ahora, simplemente lo devolvemos.
      console.log("Token ha expirado, necesita lógica de refresco.");
      return token;
    },

    // El callback 'session' se ejecuta cada vez que se accede a la sesión (ej. con auth()).
    async session({ session, token }) {
      // Copiamos los datos desde el token al objeto de sesión final.
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      session.portalUrl = token.portalUrl as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
});
