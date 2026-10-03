import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CLOUDINARY_FOLDER } from "@/lib/cloudinary";
import { signCloudinaryUpload } from "@/lib/cloudinary-server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Tanda tangan unggahan Cloudinary untuk dashboard admin.
 *
 * Preset Cloudinary project ini bertipe SIGNED, jadi browser tidak bisa
 * mengunggah tanpa tanda tangan. Signature (SHA-1 dari parameter + api_secret)
 * dibuat di sini karena hanya server yang boleh memegang api_secret.
 *
 * Digerbangi cookie admin yang sama dengan route dashboard lain: tanpa itu,
 * siapa pun bisa memakai kuota Cloudinary akun ini untuk mengunggah berkasnya
 * sendiri.
 */
/** Sub-folder khusus demo — boleh dipakai tanpa sesi admin (dengan rate limit). */
const DEMO_FOLDER = CLOUDINARY_FOLDER + "/demo";

export async function POST(request: Request) {
  // `folder` menentukan lokasi aset di Cloudinary dan nilainya ikut
  // ditandatangani. Hanya folder milik aplikasi ini yang boleh dipakai, supaya
  // tanda tangan tidak bisa dipakai menulis ke folder lain di akun yang sama.
  let folder = CLOUDINARY_FOLDER;
  try {
    const body = await request.json();
    if (typeof body?.folder === "string" && body.folder) folder = body.folder;
  } catch {
    // Body kosong/kacau bukan masalah — pakai folder default.
  }

  if (folder !== CLOUDINARY_FOLDER && !folder.startsWith(CLOUDINARY_FOLDER + "/")) {
    return NextResponse.json({ error: "Folder tidak diizinkan" }, { status: 400 });
  }

  // Dua jalur akses:
  //   - admin (cookie pesanan_auth): folder mana pun milik app ini;
  //   - publik (form demo /penawaran/demo): HANYA sub-folder demo, dan
  //     di-rate-limit per IP supaya kuota Cloudinary tidak bisa dihabiskan
  //     orang luar.
  const isAdmin = (await cookies()).get("pesanan_auth")?.value === "true";
  if (!isAdmin) {
    if (!folder.startsWith(DEMO_FOLDER)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`cloudinary-sign-demo:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Terlalu sering. Coba lagi sebentar." }, { status: 429 });
    }
  }

  const signed = signCloudinaryUpload(folder);
  if (!signed) {
    return NextResponse.json(
      { error: "Cloudinary belum dikonfigurasi" },
      { status: 503 }
    );
  }

  return NextResponse.json(signed);
}
