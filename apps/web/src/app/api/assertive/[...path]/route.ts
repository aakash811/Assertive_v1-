import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const key = process.env.ASSERTIVE_API_KEY;

  if (!key) {
    return NextResponse.json(
      { error: "Dashboard API key is not configured" },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  const base =
    process.env.ASSERTIVE_INTERNAL_API_URL ?? "http://localhost:4321/api";
  const url = new URL(`${base.replace(/\/$/, "")}/${path.join("/")}`);

  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${key}`);
  headers.delete("host");

  const projectId = (await cookies()).get("assertive-project-id")?.value;

  if (projectId) {
    headers.set("x-project-id", projectId);
  }
  const response = await fetch(url, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
