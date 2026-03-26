import { createAuthClient } from "better-auth/client";
import { siwpClient } from "@zig-zag/better-siwp/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    siwpClient(),
  ],
});