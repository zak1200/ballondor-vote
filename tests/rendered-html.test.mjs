import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createTestWorker } from "./worker-fixture.mjs";

const worker = await createTestWorker();
after(async () => { await worker.dispose(); });

test("renders Zainab’s pharmacy, letter, and pressure-free choices", async () => {
  const response = await worker.dispatchFetch("http://localhost/", { headers: { accept: "text/html" } });

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>For Zainab · The Little Love Pharmacy<\/title>/);
  assert.match(html, /A prescription/);
  assert.match(html, /Dear Zainab/);
  assert.match(html, /because you feel obliged/);
  assert.match(html, /I need a little time/);
  assert.match(html, /My answer is no/);
  assert.match(html, /are saved so I can read them/);
  assert.doesNotMatch(html, /Vote closed/);
});

test("renders the private dashboard without revealing answers or an access key", async () => {
  const response = await worker.dispatchFetch("http://localhost/responses");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Private access key/);
  assert.doesNotMatch(html, /test-only-access-key/);
  assert.doesNotMatch(html, /response-row/);
});
