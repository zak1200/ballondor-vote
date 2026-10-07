import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createTestWorker } from "./worker-fixture.mjs";

const worker = await createTestWorker();
after(async () => { await worker.dispose(); });

test("renders Zainab’s pharmacy, letter, photo, and yes/no choices", async () => {
  const response = await worker.dispatchFetch("http://localhost/", { headers: { accept: "text/html" } });

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>Zainab’s Pharmacy · For you, with love<\/title>/);
  assert.match(html, /A prescription/);
  assert.match(html, /Dear Zainab/);
  assert.match(html, /because you feel obliged/);
  assert.match(html, /src="\/assets\/zainab.jpg"/);
  assert.match(html, /My favourite part\? You\./);
  assert.doesNotMatch(html, /necklace/i);
  assert.doesNotMatch(html, /I need a little time/);
  assert.doesNotMatch(html, /My answer is no/);
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
