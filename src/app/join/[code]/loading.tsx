import { Logo } from "@/components/logo";

const pulse =
  "animate-pulse rounded-[2px] bg-[color:var(--cc-ivory)]/[0.06] motion-reduce:animate-none";

export default function Loading() {
  return (
    <main className="club-shell min-h-screen px-4 py-5">
      <section className="club-rise mx-auto flex w-full max-w-md flex-col">
        <header className="club-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <Logo className="w-32" />
            <div className={`${pulse} h-7 w-20`} />
          </div>
          <p className="club-eyebrow mt-5">Tonight&rsquo;s motion</p>
          <div className={`${pulse} mt-2 h-7 w-4/5`} />
        </header>

        <div className="club-panel mt-4 p-6">
          <div className={`${pulse} h-3 w-24`} />
          <div className={`${pulse} mt-3 h-8 w-11/12`} />

          <div className="mt-7 space-y-3">
            <div className={`${pulse} h-14 w-full`} />
            <div className={`${pulse} h-14 w-full`} />
            <div className={`${pulse} h-14 w-full`} />
          </div>
        </div>
      </section>
    </main>
  );
}
