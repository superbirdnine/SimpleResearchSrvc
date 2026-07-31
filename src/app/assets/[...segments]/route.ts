import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveAsset } from "@/lib/notes";

export const dynamic = "force-dynamic";
const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif", ".gif": "image/gif", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".pdf": "application/pdf",
  ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  try {
    const [collection, ...relative] = segments;
    const full = resolveAsset(collection, relative);
    return new NextResponse(fs.readFileSync(full), {
      headers: {
        "Content-Type": MIME_TYPES[path.extname(full).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
}
