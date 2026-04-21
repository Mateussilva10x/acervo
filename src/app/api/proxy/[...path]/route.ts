/**
 * Proxy server-side para o backend Spring Boot.
 * Resolve CORS: o browser chama /api/proxy/* (mesmo origin),
 * e o Next.js repassa server-to-server para localhost:8080.
 *
 * Exemplo: POST /api/proxy/api/v1/auth/login
 *       → POST http://localhost:8080/api/v1/auth/login
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL ?? "http://localhost:8080";

function buildBackendUrl(path: string[], req: NextRequest): string {
  const joined = path.join("/");
  const search = req.nextUrl.search; // query string, se houver
  return `${BACKEND}/${joined}${search}`;
}

function forwardHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;
  return headers;
}

async function proxy(
  req: NextRequest,
  params: { path: string[] },
  method: string,
): Promise<NextResponse> {
  const url = buildBackendUrl(params.path, req);
  const headers = forwardHeaders(req);

  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "DELETE") {
    try {
      init.body = await req.text();
    } catch {
      // sem body
    }
  }

  try {
    const res = await fetch(url, init);
    const ct = res.headers.get("content-type") ?? "application/json";
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": ct },
    });
  } catch (err) {
    console.error("[proxy] Erro ao contactar backend:", err);
    return NextResponse.json(
      { error: "Backend indisponível" },
      { status: 503 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await params, "POST");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await params, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await params, "DELETE");
}
