const { createClient } = await import("@supabase/supabase-js");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const res = await db.from("hpp_items").select("id, item, variasi, harga").eq("variasi", "Uji Coba");
console.log(JSON.stringify(res.data));
