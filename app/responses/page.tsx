"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Heart, LockKeyhole, RefreshCw } from "lucide-react";

type Event = { id: string; sessionId: string; choice: "yes" | "time" | "no" | "playful_no"; createdAt: string };
const labels = { yes: "Yes, one little step together", time: "I need a little time", no: "My answer is no", playful_no: "Tap on the playful “No”" };

export default function ResponsesPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const key = useRef("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/responses", { headers: { Authorization: `Bearer ${key.current}` }, cache: "no-store" });
      const result = await response.json() as { error?: string; events?: Event[] };
      if (!response.ok) throw new Error(result.error ?? "Could not load responses.");
      if (!Array.isArray(result.events)) throw new Error("Unexpected dashboard response. Please try again.");
      setEvents(result.events);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load responses."); }
    finally { setLoading(false); }
  }

  return <main className="love-site dashboard"><Link className="dashboard-home" href="/">← Zainab’s Pharmacy</Link><div className="dashboard-card"><span className="question-heart"><LockKeyhole /></span><span className="eyebrow">JUST FOR YOU</span><h1>Zainab’s <em>little answers.</em></h1><p>Responses come from visitors to this page. Their identity is not verified.</p>
    {events === null ? <form onSubmit={(event) => { event.preventDefault(); void load(); }}><label htmlFor="access-key">Private access key</label><input id="access-key" name="key" type="password" required autoComplete="current-password" onChange={(event) => { key.current = event.target.value; }} /><button className="yes-button" disabled={loading}>{loading ? "Opening…" : "Open my dashboard"}<Heart size={16} /></button></form> : <><div className="dashboard-toolbar"><span>{events.length} recent interaction{events.length !== 1 ? "s" : ""}</span><button className="text-button" disabled={loading} onClick={() => void load()}><RefreshCw size={14} /> Refresh</button><button className="text-button" onClick={() => { key.current = ""; setEvents(null); setError(""); }}>Lock</button></div>{events.length ? <div className="response-list">{events.map((event) => <article key={event.id} className={`response-row choice-${event.choice}`}><span>{event.choice === "yes" ? "♡" : event.choice === "time" ? "◷" : "✉"}</span><div><strong>{labels[event.choice]}</strong><small>Visit {event.sessionId.slice(0, 8)}</small></div><time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString("en-GB")}</time></article>)}</div> : <p className="empty-responses">No answers yet. Once someone sends an answer, it will appear here.</p>}<p className="dashboard-note">Showing the latest 200 interactions. A playful tap is not a final answer.</p></>}
    {error && <p role="alert" className="save-error">{error}</p>}
    </div></main>;
}
