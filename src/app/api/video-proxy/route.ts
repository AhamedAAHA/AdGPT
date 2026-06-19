import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "videos.pexels.com",
  "images.pexels.com",
  "pexels.com",
  "remotion.media",
  "replicate.delivery",
  "pbxt.replicate.delivery",
  "replicateusercontent.com",
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  );
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!isAllowedHost(target.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  const range = req.headers.get("range");
  const upstreamHeaders: HeadersInit = {
    Referer: "https://www.pexels.com/",
    "User-Agent": "AdGPT/1.0",
  };
  if (range) upstreamHeaders["Range"] = range;

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), { headers: upstreamHeaders });
  } catch {
    return NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: "upstream failed", status: upstream.status },
      { status: upstream.status }
    );
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=3600");

  for (const name of ["Content-Length", "Content-Range", "Accept-Ranges"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
