/**
 * Server-side Supabase client.
 *
 * Uses `createServerClient` from @supabase/ssr with Next.js cookies().
 * Safe to use in Server Components, Route Handlers, and Server Actions.
 *
 * This client is per-request: call `createClient()` inside each function
 * that needs it — do not share across requests.
 */
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { DB_SCHEMA } from "@/lib/supabase/schema";

/**
 * URL yang benar-benar bisa dipakai supabase-js (http/https) — bukan cuma
 * non-empty. Tanpa cek ini, nilai env yang salah format lolos cek kehadiran
 * lalu `createClient` melempar "Invalid supabaseUrl" dan SEMUA halaman ikut
 * 500, padahal setiap pembacaan data punya jalur cadangan.
 */
function isValidHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** True when the Supabase env vars are present AND the URL is usable. */
export function supabaseConfigured(): boolean {
  return (
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** True when the service-role env vars are present AND the URL is usable. */
export function serviceRoleConfigured(): boolean {
  return (
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

/**
 * Service-role client — MENEMBUS RLS. Hanya untuk server; jangan pernah
 * diimpor dari Client Component (`"use client"`), karena kuncinya rahasia.
 *
 * Dipakai semua akses tabel operasional (orders, order_status_history,
 * maklon_orders, maklon_status_history) yang dulu mengandalkan policy anon
 * `USING (true)`. Sejak policy itu ditutup (migrasi 0027), service role
 * adalah satu-satunya jalur yang boleh menyentuh tabel-tabel tersebut.
 *
 * Otorisasi tetap dilakukan di level route handler lewat hasAdminAccess(),
 * jadi client ini tidak boleh dipakai tanpa cek auth lebih dulu.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "createServiceClient: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi"
    );
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Schema terpisah: `.from()` dan `.rpc()` menunjuk ke nexa_sport.
    db: { schema: DB_SCHEMA },
  });
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Schema terpisah: `.from()` dan `.rpc()` menunjuk ke nexa_sport.
      db: { schema: DB_SCHEMA },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
            // See lib/supabase/middleware.ts.
          }
        },
      },
    }
  );
}
