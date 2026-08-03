import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;

const providers = [];
if (googleId && googleSecret) {
  providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "travelnjoy-fallback-secret-key-32chars!",
  providers,
  trustHost: true,
  pages: {
    signIn: '/login',
  },
})
