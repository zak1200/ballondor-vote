import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { responses } from "@/db/schema";

const headers = { "Cache-Control": "no-store" };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const choices = new Set(["yes", "time", "no", "playful_no"]);

async function sameKey(a: string, b: string) {
  const encode = new TextEncoder();
  const [left, right] = await Promise.all(
    [a, b].map(async (value) => new Uint8Array(await crypto.subtle.digest("SHA-256", encode.encode(value)))),
  );
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

export async function GET(request: Request) {
  const key = env.ZAINAB_ADMIN_KEY;
  if (typeof key !== "string" || key.length < 24) {
    return Response.json({ error: "The private dashboard is not configured yet." }, { status: 503, headers });
  }
  const supplied = request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
  if (!supplied || supplied.length > 256 || !(await sameKey(supplied, key))) {
    return Response.json({ error: "Incorrect access key." }, { status: 401, headers });
  }
  try {
    const events = await getDb().select().from(responses)
      .orderBy(desc(responses.createdAt), desc(responses.id)).limit(200);
    return Response.json({ events }, { headers });
  } catch {
    return Response.json({ error: "Responses are temporarily unavailable." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Origin not allowed." }, { status: 403, headers });
  }
  try {
    const body = await request.text();
    if (body.length > 2048) return Response.json({ error: "Request too large." }, { status: 413, headers });
    let payload: unknown;
    try { payload = JSON.parse(body); } catch {
      return Response.json({ error: "Invalid response." }, { status: 400, headers });
    }
    if (!payload || typeof payload !== "object") {
      return Response.json({ error: "Invalid response." }, { status: 400, headers });
    }
    const { eventId, sessionId, choice } = payload as Record<string, unknown>;
    if (typeof eventId !== "string" || !uuid.test(eventId) ||
        typeof sessionId !== "string" || !uuid.test(sessionId) ||
        typeof choice !== "string" || !choices.has(choice)) {
      return Response.json({ error: "Invalid response." }, { status: 400, headers });
    }
    await getDb().insert(responses).values({
      id: eventId, sessionId, choice: choice as "yes" | "time" | "no" | "playful_no", createdAt: new Date(),
    }).onConflictDoNothing();
    return Response.json({ saved: true }, { status: 201, headers });
  } catch {
    return Response.json({ error: "Your answer could not be sent. Please try again." }, { status: 503, headers });
  }
}
