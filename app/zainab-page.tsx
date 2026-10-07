"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, Check, Flower2, Heart, HeartHandshake, Mail, Plus, Sparkles } from "lucide-react";

type Choice = "yes" | "time" | "no";
const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
const replies: Record<Choice, { title: string; text: string }> = {
  yes: { title: "Then, one little step at a time. ♡", text: "Thank you for making room for us. No rush, no pressure. Just you, me, and the chance to build something gentle together." },
  time: { title: "Take all the time you need.", text: "You don’t have to decide today. Thank you for telling me how you feel. Your pace matters just as much as my feelings." },
  no: { title: "I respect your answer, Zainab.", text: "Thank you for being honest with me. My feelings don’t create an obligation for you. I wish you all the softness in the world." },
};

function Bouquet() {
  return (
    <svg viewBox="0 0 300 260" className="bouquet" aria-hidden="true">
      <path d="M120 235 147 105M146 236 190 74M158 231 210 148M132 232 85 129M146 232 124 55" fill="none" stroke="#6e8867" strokeWidth="3" strokeLinecap="round" />
      <path d="M147 183c-47-36-45-8-8 12M166 154c42-42 46-8-5 21M123 168c-40-27-31 13 10 17M148 135c-28-31-43-4-2 19" fill="#a0ad84" />
      {[[145, 100, 1], [193, 65, .9], [85, 125, .8], [211, 142, .75], [122, 45, .68]].map(([x, y, scale], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
          {[0, 72, 144, 216, 288].map((angle) => <ellipse key={angle} cx="0" cy="-15" rx="14" ry="20" fill={i % 2 ? "#ead4be" : "#e3b9b3"} stroke="#c99690" strokeWidth="1" transform={`rotate(${angle})`} />)}
          <circle r="8" fill="#c8a361" /><circle r="3" fill="#f9ebc9" />
        </g>
      ))}
      <path d="m107 174 82 3-32 76-17-1z" fill="#e6dbc4" fillOpacity=".9" stroke="#cbbda4" />
      <path d="m116 184 49 58 14-58M121 204l53-7" fill="none" stroke="#f9f4e9" strokeWidth="2" />
      <path d="M135 233c-25-27-34-4 9 7-5-38 34-24 9-2m-11 2-19 13m32-13 18 12" fill="none" stroke="#a7645e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ZainabPage() {
  const [opened, setOpened] = useState(false);
  const [escapes, setEscapes] = useState(0);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [answer, setAnswer] = useState<Choice | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const arena = useRef<HTMLDivElement>(null);
  const session = useRef<string | null>(null);
  const pending = useRef<{ eventId: string; choice: Choice } | null>(null);

  function sessionId() {
    if (session.current) return session.current;
    try {
      const existing = sessionStorage.getItem("zainab-visit");
      session.current = existing ?? crypto.randomUUID();
      sessionStorage.setItem("zainab-visit", session.current);
    } catch { session.current = crypto.randomUUID(); }
    return session.current;
  }

  async function send(choice: Choice | "playful_no", eventId = crypto.randomUUID()) {
    if (isGitHubPages) return;
    const response = await fetch("/api/responses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice, eventId, sessionId: sessionId() }),
    });
    if (!response.ok) throw new Error("Your answer hasn’t been sent. Please try again when you’re ready.");
  }

  async function choose(choice: Choice) {
    if (saving) return;
    setSaving(true);
    setError("");
    if (pending.current?.choice !== choice) pending.current = { choice, eventId: crypto.randomUUID() };
    try {
      await send(choice, pending.current.eventId);
      setAnswer(choice);
      pending.current = null;
    } catch { setError("Your answer hasn’t been sent. Please try again when you’re ready."); }
    finally { setSaving(false); }
  }

  function escape(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void choose("no");
      return;
    }
    const box = arena.current;
    if (!box) return;
    const width = box.clientWidth - event.currentTarget.offsetWidth - 12;
    const steps = [.1, .62, .28, .82, .45];
    setPosition({ left: Math.max(6, width * steps[escapes % steps.length]), top: escapes % 2 ? 92 : 62 });
    setEscapes((count) => count + 1);
    void send("playful_no").catch(() => { /* Final answers show a retry message if saving fails. */ });
  }

  return (
    <div className="love-site">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Zainab’s Pharmacy, home"><span className="brand-mark"><Plus strokeWidth={3} /></span><span>Zainab’s<br /><b>pharmacy.</b></span></a>
        <span className="header-note">A little something, just for you <Heart size={13} /></span>
        <a className="header-link" href="#letter">Your little letter <ArrowRight size={15} /></a>
      </header>

      <main id="home">
        <section className="hero content-width">
          <div className="hero-copy">
            <span className="eyebrow"><span className="status-dot" /> MADE WITH TENDERNESS · FOR ZAINAB</span>
            <h1>A prescription<br />for <em>you &amp; me.</em><span className="heading-heart">♡</span></h1>
            <p className="hero-description">A little courage. A lot of tenderness. And the hope that, this time, we could write our story a little differently.</p>
            <a className="primary-link" href="#letter">There’s something I want to tell you <ArrowDown size={17} /></a>
            <p className="hero-footnote"><HeartHandshake size={16} /> No rush. Your pace. Always.</p>
          </div>
          <div className="prescription-wrap">
            <span className="handwritten top-note">For you, Zainab <span>↘</span></span>
            <article className="prescription">
              <div className="rx-top"><span className="rx-symbol">℞</span><span>ZAINAB’S PHARMACY<br /><small>A very personal preparation</small></span><Plus size={20} /></div>
              <div className="rx-rule" />
              <div className="patient-line"><span>Made especially for</span><strong>Zainab</strong><Heart size={15} /></div>
              <div className="bouquet-wrap"><Bouquet /><span className="bouquet-label">a little memory of Sunday</span></div>
              <div className="dosage"><span>INGREDIENTS</span><p>A pinch of courage<br />A generous dose of patience<br /><b>So much room for you.</b></p></div>
              <div className="rx-bottom"><span>DIRECTIONS: ONE LITTLE STEP AT A TIME</span><Heart size={15} /></div>
              <div className="rx-stamp">100%<br /><span>from the heart</span></div>
            </article>
            <span className="small-spark spark-one">✧</span><span className="small-spark spark-two">✧</span>
            <div className="little-label"><span className="pill-icon" /><span>Keep somewhere close to your heart.</span></div>
          </div>
        </section>

        <div className="care-strip"><span><Flower2 size={16} /> A Sunday to remember</span><span><Heart size={16} /> An honest intention</span><span><Sparkles size={16} /> A softer beginning</span></div>

        <section className="memories content-width" aria-labelledby="memories-heading">
          <div className="section-heading"><span className="eyebrow">LITTLE MOMENTS. BIG FEELINGS.</span><h2 id="memories-heading">That Sunday, <em>with you.</em></h2><p>Some ordinary days stay with us a little longer.</p></div>
          <div className="memory-grid">
            <article className="memory-card"><span className="memory-number">01 /</span><span className="memory-icon pink"><Flower2 /></span><h3>Flowers, just because</h3><p>Because you deserve beautiful things. Not just on special occasions.</p><span className="memory-caption">a little dose of happiness</span></article>
            <article className="memory-card memory-photo-card"><span className="memory-number">02 /</span><Image className="memory-photo" src={isGitHubPages ? "/ballondor-vote/assets/zainab.jpg" : "/assets/zainab.jpg"} alt="Zainab, a little memory of our Sunday together" width={2880} height={3840} unoptimized /><div className="memory-photo-copy"><h3>My favourite part? You.</h3><p>That smile. That little moment. A memory I keep coming back to.</p><span className="memory-caption">you make ordinary days feel special</span></div></article>
            <article className="memory-card"><span className="memory-number">03 /</span><span className="memory-icon sage"><Mail /></span><h3>Words that stayed</h3><p>Our conversation. Your honesty. And that little letter I left with you.</p><span className="memory-caption">perhaps, the start of a new page</span></article>
          </div>
        </section>

        <section className="letter-section content-width" id="letter" aria-labelledby="letter-heading">
          <div className="letter-intro"><span className="eyebrow">OPEN WHENEVER YOU FEEL READY</span><h2 id="letter-heading">A few things<br />I wanted you <em>to know.</em></h2><p>A little addition to Sunday’s letter. Nothing you need to answer right away. Just a few words I wanted to leave with you.</p><span className="handwritten letter-note">with all my heart ♡</span></div>
          <div className={`letter-paper ${opened ? "is-open" : ""}`}>
            <span className="letter-topline"><Mail size={16} /> A LETTER FOR ZAINAB <span>♡</span></span>
            <h3>Dear Zainab,</h3>
            <p>On Sunday, the flowers were a little way of saying something much bigger: you mean so much to me. But my favourite part of the day was simply being with you.</p>
            <p>When you told me you were scared of going through our story again, I heard you. Six years ago, I was 19. I didn’t have the maturity to love the way I want to today.</p>
            {opened && <div className="letter-more"><p>I know you’re finding yourself, and I don’t want to stand in the way of that. I’d like to be someone beside whom you can still be completely you. With your dreams, your doubts, and your freedom.</p><p>I can’t promise a perfect life. I can promise to listen, to make an effort, to own my mistakes, and to show you through everyday actions that I mean what I say.</p><p>You are the love of my life. And to me, loving you also means respecting your pace. I’m ready to do my part to build something beautiful, if that’s what you want too.</p><p>I don’t want you to say yes because you feel obliged. I want it to be because you can see this making you happy. I’m sure we could build something beautiful, and I want to show you that through my actions.</p><p>So, no big leap today. Maybe just one little step, together?</p><div className="letter-signature">The one who’s thinking of you.<span>♡</span></div></div>}
            <button className="letter-toggle" type="button" onClick={() => setOpened(!opened)} aria-expanded={opened}>{opened ? "Fold my letter back up" : "Read the rest of my letter"}<ArrowRight size={15} /></button>
          </div>
        </section>

        <section className="question-section content-width" id="question" aria-labelledby="question-heading">
          <div className="question-card">
            <span className="question-heart"><Heart size={25} /></span>
            {answer ? <div className="answer-panel" role="status"><span className="eyebrow"><Check size={13} /> {isGitHubPages ? "YOUR CHOICE. ALWAYS YOURS." : "YOUR ANSWER HAS BEEN SENT"}</span><h2 id="question-heading">{replies[answer].title}</h2><p>{replies[answer].text}</p>{isGitHubPages && <p>This little page doesn’t send your answer. Tell me privately whenever you feel ready. ♡</p>}<button className="text-button" onClick={() => { setAnswer(null); setError(""); }}>I’d like to change my answer</button></div> : <>
              <span className="eyebrow">A LITTLE QUESTION, WITH NO EXPIRY DATE</span>
              <h2 id="question-heading">Could we give us a chance,<br /><em>at your pace?</em></h2>
              <p>Not to repeat the past. To get to know each other as we are today,<br className="desktop-break" /> and see where a new chapter might take us.</p>
              <blockquote className="question-promise">“I don’t want you to say yes because you feel obliged. I want it to be because you can see this making you happy. I’m sure we could build something beautiful, and I want to show you that through my actions.”</blockquote>
              <div className="answer-arena" ref={arena}>
                <button type="button" className="yes-button" disabled={saving} onClick={() => void choose("yes")}><Heart size={16} />{saving ? "One little moment…" : "Yes, one little step together"}</button>
                <button type="button" className="playful-no" disabled={saving} onClick={escape} style={position ? { left: position.left, top: position.top, right: "auto" } : undefined}>No <span>🙈</span></button>
                <span className="escape-caption" aria-live="polite">{escapes ? ["Oops. That button is a little shy…", "It thinks you deserve a little time ♡", "Someone took a dose of mischief."][Math.min(escapes - 1, 2)] : ""}</span>
              </div>
              <p className="no-pressure">A little mischief, zero pressure. Every real answer will be respected.</p>
              {error && <p className="save-error" role="alert">{error}</p>}
            </>}
            <div className="privacy-note">{isGitHubPages ? "This little page doesn’t record or send your answer. Tell me privately whenever you feel ready." : "Your choices, including taps on the playful “No”, are saved so I can read them. Nothing else."}</div>
          </div>
        </section>
      </main>
      <footer className="site-footer content-width"><span className="footer-brand"><Plus size={16} /> Zainab’s pharmacy.</span><span>One prescription. One very special Zainab. <Heart size={12} /></span><span>Made with love.</span></footer>
    </div>
  );
}
