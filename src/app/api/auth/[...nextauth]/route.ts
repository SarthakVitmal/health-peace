// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      await connectToDatabase();

      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        existingUser = new User({
          firstName: user.name.split(" ")[0],
          lastName: user.name.split(" ")[1] || "",
          email: user.email,
          image: user.image,
          provider: "google",
        });
        await existingUser.save();
      }

      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET!,
        );
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      return '/dashboard';
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", 
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };