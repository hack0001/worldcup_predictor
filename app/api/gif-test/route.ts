import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_KLIPY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" });

  const q = request.nextUrl.searchParams.get("q") || "";
  const endpoint = q ? "search" : "trending";
  const url = q
    ? `https://api.klipy.com/api/v1/${apiKey}/gifs/search?q=${encodeURIComponent(q)}&limit=3`
    : `https://api.klipy.com/api/v1/${apiKey}/gifs/trending?limit=3`;

  const res = await fetch(url);
  const text = await res.text();

  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { parsed = text; }

  return NextResponse.json({ status: res.status, url, raw: parsed });
}
