export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050914] px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b1424] p-8 text-center shadow-2xl shadow-black/40 sm:p-12">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-amber-400/10 text-3xl">
          🏆
        </div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-400">
          Ballon d&apos;Or Vote
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Vote closed
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-400">
          This project is currently offline. Thanks to everyone who took part.
        </p>
      </section>
    </main>
  );
}
