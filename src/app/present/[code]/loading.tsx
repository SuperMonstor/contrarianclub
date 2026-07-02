import { Logo } from "@/components/logo";

const pulse =
  "animate-pulse rounded-[2px] bg-[color:var(--cc-ivory)]/[0.06] motion-reduce:animate-none";

export default function Loading() {
  return (
    <main className="club-shell flex min-h-screen">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_380px]">
        <div className="club-art-stage flex flex-col p-8 sm:p-12 lg:p-14">
          <header className="relative z-10 flex items-center justify-between gap-6">
            <Logo className="w-44 sm:w-52 lg:w-60" />
            <div className={`${pulse} h-12 w-28`} />
          </header>

          <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 py-8 sm:gap-12 sm:py-12">
            <div className="max-w-5xl space-y-5">
              <div className={`${pulse} h-7 w-32`} />
              <div className={`${pulse} h-14 w-4/5`} />
              <div className={`${pulse} h-14 w-3/5`} />
            </div>
          </div>

          <footer className="relative z-10">
            <div className={`${pulse} h-4 w-40`} />
          </footer>
        </div>

        <aside className="club-panel flex flex-col items-center justify-center gap-6 border-x-0 border-b-0 p-8 sm:p-10 lg:border-y-0 lg:border-l lg:border-r-0">
          <p className="club-eyebrow">Scan to join</p>
          <div className={`${pulse} aspect-square w-full max-w-[300px]`} />
          <div className={`${pulse} h-12 w-40`} />
        </aside>
      </section>
    </main>
  );
}
