import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return Response.json({ 
    session: session?.session || null,
    user: session?.user || null,
  });
}