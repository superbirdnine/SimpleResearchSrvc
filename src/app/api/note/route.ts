import { NextRequest, NextResponse } from "next/server";
import { readNote } from "@/lib/notes";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing note id" }, { status: 400 });
  try {
    return NextResponse.json(readNote(id));
  } catch {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
}
