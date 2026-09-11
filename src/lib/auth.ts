import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const email = credentials.email.trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });

          if (!user) {
            console.log("Usuario no encontrado:", email);
            return null;
          }

          // En producción, usa bcrypt para comparar contraseñas
          // const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          const password = credentials.password.trim();
          const isPasswordValid = password === user.password;

          if (!isPasswordValid) {
            console.log("Contraseña incorrecta para:", email);
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.log("DETALLE TECNICO DEL ERROR:", JSON.stringify(error, null, 2));
          console.error("ERROR COMPLETO:", error);
          throw new Error("Fallo de conexión");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
