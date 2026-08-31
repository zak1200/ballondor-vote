"use client";

/* Static relative image paths keep the export portable under GitHub project URLs. */
/* eslint-disable @next/next/no-img-element */

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import clsx from "clsx";
import {
  Check,
  CircleAlert,
  Radio,
  RefreshCw,
  Share2,
  Trophy,
  Users,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { VOTE_CONFIG } from "./vote-config";

type CandidateId = "left" | "right";
type Counts = Record<CandidateId, number>;
type VoteRow = { candidate: CandidateId };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const isSharedMode =
  SUPABASE_URL.startsWith("https://") && SUPABASE_KEY.length > 20;

const supabase: SupabaseClient | null = isSharedMode
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

const DEMO_VOTE_KEY = "ballondor-demo-vote";

function countVotes(rows: VoteRow[] | null): Counts {
  return (rows ?? []).reduce<Counts>(
    (counts, row) => {
      if (row.candidate === "left" || row.candidate === "right") {
        counts[row.candidate] += 1;
      }
      return counts;
    },
    { left: 0, right: 0 },
  );
}

function percentages(counts: Counts) {
  const total = counts.left + counts.right;
  if (total === 0) return { left: 50, right: 50 };
  const left = Math.round((counts.left / total) * 100);
  return { left, right: 100 - left };
}

export function VoteMarket() {
  const [counts, setCounts] = useState<Counts>({ left: 0, right: 0 });
  const [selected, setSelected] = useState<CandidateId | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<CandidateId | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const odds = useMemo(() => percentages(counts), [counts]);
  const total = counts.left + counts.right;

  const refreshVotes = useCallback(async () => {
    if (!supabase) return;
    const { data, error: fetchError } = await supabase
      .from("votes")
      .select("candidate");
    if (fetchError) throw fetchError;
    setCounts(countVotes(data as VoteRow[]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        if (!supabase) {
          const demoVote = window.localStorage.getItem(DEMO_VOTE_KEY);
          if (demoVote === "left" || demoVote === "right") {
            setSelected(demoVote);
            setCounts({
              left: demoVote === "left" ? 1 : 0,
              right: demoVote === "right" ? 1 : 0,
            });
          }
          return;
        }

        let { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          const { data, error: signInError } =
            await supabase.auth.signInAnonymously();
          if (signInError) throw signInError;
          sessionData = { session: data.session };
        }

        const activeUser = sessionData.session?.user ?? null;
        if (!activeUser || cancelled) return;
        setUser(activeUser);

        const [{ data: ownVote, error: ownVoteError }] = await Promise.all([
          supabase
            .from("votes")
            .select("candidate")
            .eq("user_id", activeUser.id)
            .maybeSingle(),
          refreshVotes(),
        ]);
        if (ownVoteError) throw ownVoteError;
        if (
          ownVote?.candidate === "left" ||
          ownVote?.candidate === "right"
        ) {
          setSelected(ownVote.candidate);
        }
      } catch (startError) {
        console.error(startError);
        setError(
          "The shared vote could not load. Check the database setup in the README.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [refreshVotes]);

  useEffect(() => {
    if (!supabase) return;
    const timer = window.setInterval(() => {
      void refreshVotes().catch(() => undefined);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [refreshVotes]);

  async function voteFor(candidate: CandidateId) {
    setSaving(candidate);
    setError("");
    setNotice("");

    try {
      if (!supabase) {
        const previous = selected;
        const nextCounts = { ...counts };
        if (previous) {
          nextCounts[previous] = Math.max(0, nextCounts[previous] - 1);
        }
        nextCounts[candidate] += 1;
        window.localStorage.setItem(DEMO_VOTE_KEY, candidate);
        setCounts(nextCounts);
        setSelected(candidate);
        setNotice("Demo vote saved on this browser.");
        return;
      }

      if (!user) throw new Error("Anonymous session is not ready.");
      const { error: saveError } = await supabase.from("votes").upsert(
        { user_id: user.id, candidate },
        { onConflict: "user_id" },
      );
      if (saveError) throw saveError;
      setSelected(candidate);
      await refreshVotes();
      setNotice("Your vote is in. You can still change it.");
    } catch (voteError) {
      console.error(voteError);
      setError("Your vote was not saved. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  async function sharePoll() {
    const shareData = {
      title: "Ballon d'Or Vote",
      text: "The vote is almost 50/50. Pick your winner!",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice("Link copied — send it to the boys.");
      }
    } catch (shareError) {
      if ((shareError as DOMException).name !== "AbortError") {
        setError("Could not copy the link. Copy it from your address bar.");
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,119,242,0.18),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(33,197,111,0.12),transparent_32%)]" />
      <div className="relative mx-auto max-w-[1480px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#091121]/80 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1778f2] to-[#43a0ff] shadow-[0_0_30px_rgba(23,120,242,0.28)]">
              <Trophy className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase tracking-[0.16em] sm:text-base">
                Ballon d&apos;Or Vote
              </p>
              <p className="text-xs text-slate-400">The boys&apos; live ballot</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void sharePoll()}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Share2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Share vote</span>
          </Button>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/30">
            <img
              src="./assets/ballondor-market.webp"
              alt="The two Ballon d'Or contenders holding golden trophies"
              className="aspect-[3/2] h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent px-5 pb-5 pt-20 sm:px-7 sm:pb-7">
              <p
                dir="rtl"
                lang="ar"
                className="max-w-3xl text-lg font-bold leading-8 text-white drop-shadow-lg sm:text-xl"
              >
                {VOTE_CONFIG.commentatorLine}
              </p>
            </div>
          </div>

          <div className="flex flex-col rounded-[28px] border border-white/10 bg-[#091121]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#42e48a]">
                <Radio className="size-4 animate-pulse" aria-hidden="true" />
                Live market
              </div>
              <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                {VOTE_CONFIG.question}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                {VOTE_CONFIG.subtitle}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              {(["left", "right"] as CandidateId[]).map((candidateId) => {
                const candidate = VOTE_CONFIG.candidates[candidateId];
                const isSelected = selected === candidateId;
                const candidateOdds = odds[candidateId];
                const isBlue = candidate.color === "blue";

                return (
                  <article
                    key={candidate.id}
                    className={clsx(
                      "relative overflow-hidden rounded-2xl border p-3 transition sm:p-4",
                      isSelected && isBlue && "border-[#2f92ff] bg-[#0c2e58]",
                      isSelected && !isBlue && "border-[#35d67e] bg-[#0b3925]",
                      !isSelected && "border-white/10 bg-white/[0.035]",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-[#07101f]">
                        <Check className="size-4" aria-hidden="true" />
                        <span className="sr-only">Your current vote</span>
                      </span>
                    )}
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="size-16 rounded-full border-2 border-white/20 object-cover shadow-lg sm:size-20"
                    />
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      {candidate.name}
                    </p>
                    <p
                      className={clsx(
                        "mt-1 text-4xl font-black tracking-[-0.06em] sm:text-5xl",
                        isBlue ? "text-[#45a1ff]" : "text-[#42dd87]",
                      )}
                    >
                      {candidateOdds}%
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {counts[candidateId]}{" "}
                      {counts[candidateId] === 1 ? "vote" : "votes"}
                    </p>
                    <Button
                      type="button"
                      onClick={() => void voteFor(candidateId)}
                      disabled={loading || saving !== null}
                      aria-pressed={isSelected}
                      className={clsx(
                        "mt-4 w-full font-extrabold text-white",
                        isBlue
                          ? "bg-[#1979ef] hover:bg-[#318cf6]"
                          : "bg-[#18a95d] hover:bg-[#28bd6d]",
                      )}
                    >
                      {saving === candidateId ? (
                        <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                      ) : isSelected ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : null}
                      {isSelected ? "Your vote" : "Vote"}
                    </Button>
                  </article>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{odds.left}%</span>
                <span>{odds.right}%</span>
              </div>
              <div
                className="flex h-3 overflow-hidden rounded-full bg-white/10"
                role="img"
                aria-label={
                  odds.left +
                  "% for the left contender and " +
                  odds.right +
                  "% for the right contender"
                }
              >
                <div
                  className="bg-gradient-to-r from-[#1475e8] to-[#48a7ff] transition-[width] duration-500"
                  style={{ width: odds.left + "%" }}
                />
                <div
                  className="bg-gradient-to-r from-[#23bc68] to-[#43e48a] transition-[width] duration-500"
                  style={{ width: odds.right + "%" }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm">
              <div className="rounded-xl bg-white/[0.035] p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="size-4" aria-hidden="true" /> Total votes
                </div>
                <p className="mt-1 text-2xl font-black">{total}</p>
              </div>
              <div className="rounded-xl bg-white/[0.035] p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  {isSharedMode ? (
                    <Radio className="size-4 text-[#42e48a]" aria-hidden="true" />
                  ) : (
                    <WifiOff className="size-4 text-amber-400" aria-hidden="true" />
                  )}
                  Mode
                </div>
                <p className="mt-1 text-sm font-bold">
                  {isSharedMode ? "Shared & live" : "Local demo"}
                </p>
              </div>
            </div>

            {(notice || error || loading) && (
              <div
                className={clsx(
                  "mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
                  error
                    ? "border-red-400/20 bg-red-400/10 text-red-200"
                    : "border-white/10 bg-white/[0.035] text-slate-300",
                )}
                role="status"
                aria-live="polite"
              >
                {error ? (
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : loading ? (
                  <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="mt-0.5 size-4 shrink-0 text-[#42e48a]" aria-hidden="true" />
                )}
                <span>{error || notice || "Loading the live vote…"}</span>
              </div>
            )}

            {!isSharedMode && !loading && (
              <p className="mt-4 text-xs leading-5 text-amber-200/80">
                Demo mode keeps votes only on this device. Add the two Supabase
                variables described in the README before sharing the site.
              </p>
            )}
          </div>
        </section>

        <footer className="mt-4 flex flex-col justify-between gap-2 px-1 text-xs text-slate-500 sm:flex-row">
          <p>Fan-made private poll — no money, no betting.</p>
          <p>Not affiliated with Polymarket or France Football.</p>
        </footer>
      </div>
    </main>
  );
}
