/**
 * Next.js Edge Middleware — API Auth Proxy
 *
 * Intercepts every /api/* request before it reaches the Next.js router,
 * injects the Authorization: Bearer header (server-side only, never exposed
 * to the browser), and streams the Render backend response back to the client.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  // Build forwarded headers — inject auth key server-side
  const headers = new Headers(request.headers);
  headers.delete("host");

  const apiKey = process.env.API_SECRET_KEY;
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : null,
    });

    // Forward the response (including SSE streams) back to the browser
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[Middleware] Upstream fetch failed:", err);
    return NextResponse.json(
      { detail: "Backend service unavailable" },
      { status: 503 }
    );
  }
}

// Only intercept /api/* routes
export const config = {
  matcher: "/api/:path*",
};
