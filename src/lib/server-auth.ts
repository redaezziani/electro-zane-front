// frontend/src/lib/server-auth.ts
import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function getServerUser() {
  const accessToken = (await cookies()).get("access_token")?.value;

  console.log("[getServerUser] Has access_token:", !!accessToken);
  console.log("[getServerUser] Using API URL:", BACKEND_API_URL);

  if (!accessToken) return null;

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/validate`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    console.log("[getServerUser] Response status:", response.status);

    if (!response.ok) return null;

    const data = await response.json();
    console.log("[getServerUser] User fetched:", data.user?.email);
    return data.user ?? null;
  } catch (err) {
    console.error("[getServerUser] Server-side token validation failed:", err);
    return null;
  }
}
