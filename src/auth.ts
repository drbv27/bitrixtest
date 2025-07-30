// src/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import dbConnect from "./lib/mongoose";
import UserCredentials from "./models/UserCredentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        await dbConnect();

        if (user.id) {
          await UserCredentials.findOneAndUpdate(
            { userId: user.id },
            {
              userId: user.id,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              accessTokenExpires:
                Date.now() + (account.expires_in as number) * 1000,
              portalUrl: account.client_endpoint,
            },
            { upsert: true }
          );

          token.accessToken = account.access_token;
          token.portalUrl = account.client_endpoint;
          token.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user && session.user) {
        session.user.id = token.user.id;
        session.user.name = token.user.name;
        session.user.email = token.user.email ?? "";
        session.user.image = token.user.image;
      }

      session.accessToken = token.accessToken;
      session.portalUrl = token.portalUrl;

      // --- LA CORRECCIÓN FINAL Y DEFINITIVA ESTÁ AQUÍ ---
      // Comprobamos si 'token.error' es un string antes de asignarlo.
      // Si no lo es, asignamos 'undefined' para cumplir con el tipo.
      session.error = typeof token.error === "string" ? token.error : undefined;

      return session;
    },
  },
});
