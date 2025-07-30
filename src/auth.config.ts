// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/",
  },
  providers: [
    {
      id: "bitrix24",
      name: "Bitrix24",
      type: "oauth",
      clientId: process.env.AUTH_BITRIX_CLIENT_ID,
      clientSecret: process.env.AUTH_BITRIX_CLIENT_SECRET,
      checks: ["state"],
      authorization: {
        url: "https://nuevavida.bitrix24.com/oauth/authorize/",
        params: { scope: "user,crm" },
      },
      token: {
        url: "https://oauth.bitrix.info/oauth/token/",
        async conform(response: Response) {
          const body = await response.json();
          body.token_type = "Bearer";
          return new Response(JSON.stringify(body), response);
        },
      },
      userinfo: "https://nuevavida.bitrix24.com/rest/user.current.json",
      async profile(profile) {
        // YA NO NECESITAMOS ESTA LÍNEA, PUEDES BORRARLA
        // console.log("PERFIL RECIBIDO DE BITRIX24:", profile);

        // ¡LA CORRECCIÓN FINAL! Leemos desde 'profile.result'
        const user = profile.result;

        return {
          id: user.ID,
          name: `${user.NAME} ${user.LAST_NAME}`,
          email: user.EMAIL,
          image: user.PERSONAL_PHOTO || null,
        };
      },
    },
  ],
} satisfies NextAuthConfig;
