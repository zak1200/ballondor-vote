import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { createTestWorker, testKey } from "./worker-fixture.mjs";

const worker = await createTestWorker();
after(async () => { await worker.dispose(); });
const url = "http://localhost/api/responses";
const auth = { Authorization: `Bearer ${testKey}` };
function post(body, extraHeaders = {}) {
  return worker.dispatchFetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...extraHeaders }, body: typeof body === "string" ? body : JSON.stringify(body) });
}

test("keeps the response dashboard private", async () => {
  for (const headers of [{}, { Authorization: "Bearer wrong-key" }]) {
    const response = await worker.dispatchFetch(url, { headers });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal((await response.json()).events, undefined);
  }
});

test("rejects malformed, oversized, and cross-origin responses", async () => {
  for (const body of ["{", null, {}, { eventId: randomUUID(), sessionId: randomUUID(), choice: "invented" }]) {
    assert.equal((await post(body)).status, 400);
  }
  assert.equal((await post("x".repeat(2049))).status, 413);
  assert.equal((await post({}, { Origin: "https://another-site.example" })).status, 403);
});

test("persists each choice and makes it visible only with the access key", async () => {
  const sessionId = randomUUID();
  const ids = [];
  for (const choice of ["playful_no", "yes", "time", "no"]) {
    const eventId = randomUUID();
    ids.push(eventId);
    const response = await post({ eventId, sessionId, choice }, { Origin: "http://localhost" });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { saved: true });
  }
  const response = await worker.dispatchFetch(url, { headers: auth });
  assert.equal(response.status, 200);
  const { events } = await response.json();
  assert.equal(events.filter((event) => ids.includes(event.id)).length, 4);
  assert.deepEqual(new Set(events.filter((event) => event.sessionId === sessionId).map((event) => event.choice)), new Set(["playful_no", "yes", "time", "no"]));
  assert.ok(events.every((event) => Number.isFinite(Date.parse(event.createdAt))));
});

test("retrying a saved answer does not record it twice", async () => {
  const payload = { eventId: randomUUID(), sessionId: randomUUID(), choice: "yes" };
  assert.equal((await post(payload)).status, 201);
  assert.equal((await post(payload)).status, 201);
  const { events } = await (await worker.dispatchFetch(url, { headers: auth })).json();
  assert.equal(events.filter((event) => event.id === payload.eventId).length, 1);
});
