import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        isVerification: { label: "isVerification", type: "text" }
      },
      async authorize(credentials) {
        const identifier = (credentials?.email as string)?.trim();
        if (!identifier) return null;

        // OTP Verification Flow
        if (credentials?.isVerification === "true") {
          const otp = credentials.otp as string;
          if (!otp) return null;

          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: { equals: identifier, mode: "insensitive" } },
                { name: { equals: identifier, mode: "insensitive" } }
              ]
            }
          });

          if (!user || !user.email) return null;

          const { getRedisClient } = await import("@/lib/redis/client");
          const redis = await getRedisClient();
          const storedOtp = await redis.get(`auth:otp:${user.email}`);

          if (storedOtp !== otp) {
            throw new Error("Invalid or expired OTP.");
          }

          // Mark email as verified
          await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() }
          });

          await redis.del(`auth:otp:${user.email}`);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }

        // Standard Login Flow (username or email + password)
        const password = credentials?.password as string;
        if (!password) {
          return null;
        }

        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier, mode: "insensitive" } },
              { name: { equals: identifier, mode: "insensitive" } }
            ]
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        // Check email verification if required
        const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true";
        if (requireEmailVerification && !user.emailVerified) {
          throw new Error("Please verify your email address before logging in.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await db.creditWallet.create({
          data: {
            userId: user.id,
            balance: 200,
            lifetimeGranted: 200,
            transactions: {
              create: {
                type: 'SIGNUP_GRANT',
                amount: 200,
                balanceAfter: 200
              }
            }
          }
        });
      }
    }
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (session.user) {
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture !== undefined) session.user.image = token.picture as string | null;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = String(user.id);
        token.name = String(user.name || "");
        token.email = String(user.email || "");
        let userImage = user.image || "";
        // If image is a massive base64 string, don't store in cookie to avoid 4KB limit
        if (typeof userImage === 'string' && userImage.length > 2000) {
          userImage = "";
        }
        token.picture = String(userImage);
      }

      if (trigger === "update" && session) {
        if (session.name !== undefined) {
          token.name = String(session.name);
        }
        if (session.email !== undefined) {
          token.email = String(session.email);
        }
        if (session.image !== undefined) {
          let updatedImage = session.image;
          if (typeof updatedImage === 'string' && updatedImage.length > 2000) {
            updatedImage = "";
          }
          token.picture = String(updatedImage);
        }
      }
      
      return token;
    }
  }
});
