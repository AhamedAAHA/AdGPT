import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function isConfiguredSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("supabase.co") &&
    !url.includes("your-project") &&
    !url.includes("placeholder")
  );
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isConfiguredSupabaseUrl(url) || !key || key.includes("your-anon")) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url!, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfiguredSupabaseUrl(url) || !key || key.includes("your-")) {
    return null;
  }

  return createSupabaseClient(url!, key);
}
