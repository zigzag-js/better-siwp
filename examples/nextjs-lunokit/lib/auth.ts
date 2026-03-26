import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { siwp } from "@zig-zag/better-siwp";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    siwp({
      domain:
        process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ||
        "localhost:3000",
    }),
  ],
});
