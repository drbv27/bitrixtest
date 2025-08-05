// src/auth.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";
import dbConnect from "./lib/mongoose";
import UserCredentials from "./models/UserCredentials";

/**
 * Toma un token existente y, si ha expirado, usa el refresh token para obtener uno nuevo.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    console.log("Token de acceso expirado. Intentando refrescar...");
    await dbConnect();

    const url = "https://oauth.bitrix.info/oauth/token/";

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.AUTH_BITRIX_CLIENT_ID!,
        client_secret: process.env.AUTH_BITRIX_CLIENT_SECRET!,
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("Error al refrescar el token:", refreshedTokens);
      throw refreshedTokens;
    }

    console.log("Token refrescado exitosamente.");

    const newExpiresAt =
      Date.now() + (refreshedTokens.expires_in as number) * 1000;

    // Actualiza las credenciales en la base de datos para los procesos de backend
    if (token.user?.id) {
      await UserCredentials.findOneAndUpdate(
        { userId: token.user.id },
        {
          accessToken: refreshedTokens.access_token,
          // Bitrix24 puede o no devolver un nuevo refresh token. Si no, usamos el antiguo.
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          accessTokenExpires: newExpiresAt,
        }
      );
    }

    // Devuelve el nuevo token actualizado para la sesión del usuario
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: newExpiresAt,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined, // Limpiamos cualquier error previo
    };
  } catch (error) {
    console.error("Error en la función refreshAccessToken", error);
    return {
      ...token,
      error: "RefreshAccessTokenError", // Marcamos el token con un error
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        // Lógica de inicio de sesión inicial (ya funciona)
        // ... (el código que ya teníamos se mantiene)
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires:
            Date.now() + (account.expires_in as number) * 1000,
          portalUrl: account.client_endpoint,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      }

      // Comprobamos si el token sigue siendo válido
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token; // Si es válido, lo devolvemos
      }

      // Si ha expirado, llamamos a nuestra función para refrescarlo
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Pasamos los datos del token a la sesión
      if (token.user && session.user) {
        session.user.id = token.user.id;
        session.user.name = token.user.name;
        session.user.email = token.user.email ?? "";
        session.user.image = token.user.image;
      }

      session.accessToken = token.accessToken;
      session.portalUrl = token.portalUrl;
      session.error = token.error;

      return session;
    },
  },
});
