import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID ?? "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
      tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
      authorization: {
        params: { scope: "openid profile email User.Read Files.Read" },
      },
    }),
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });
        
        if (!user) {
          // Auto-register for demo
          const hashed = await hash(credentials.password as string, 12);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email as string,
              name: (credentials.email as string).split("@")[0],
              password: hashed,
            },
          });
          return { id: newUser.id as string, email: newUser.email as string, name: newUser.name as string };
        }
        
        const valid = await compare(credentials.password as string, (user.password as string) || "");
        if (!valid) return null;
        
        return { id: user.id as string, email: user.email as string, name: user.name as string };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session as Record<string, unknown>).provider = token.provider;
        (session as Record<string, unknown>).accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "apple" || account?.provider === "microsoft-entra-id") {
        // Upsert user in our in-memory store
        const existing = await prisma.user.findFirst({
          where: { email: user.email as string },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email as string,
              name: user.name as string,
              image: user.image,
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  debug: process.env.NODE_ENV === "development",
});
