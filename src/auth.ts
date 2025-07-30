// src/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import dbConnect from "./lib/mongoose"; // Importamos la conexión a la BD
import UserCredentials from "./models/UserCredentials"; // Importamos el nuevo modelo

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        await dbConnect(); // Conectamos a la BD
        // Guardamos o actualizamos las credenciales en la BD para el proceso automático
        await UserCredentials.findOneAndUpdate(
          { userId: user.id },
          {
            userId: user.id,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires:
              Date.now() + (account.expires_in as number) * 1000,
            portalUrl: (account as any).client_endpoint,
          },
          { upsert: true } // Opción 'upsert': si no existe, lo crea; si existe, lo actualiza.
        );

        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires =
          Date.now() + (account.expires_in as number) * 1000;
        token.portalUrl = (account as any).client_endpoint;
        token.user = user;
        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      console.log("Token ha expirado, necesita lógica de refresco.");
      return token;
    },

    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      session.portalUrl = token.portalUrl as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
});
