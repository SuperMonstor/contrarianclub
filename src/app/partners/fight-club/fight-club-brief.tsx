import Image from "next/image";

import { ExportPdfButton } from "../export-pdf-button";
import styles from "./fight-club.module.css";

// The Contrarian x Fight Club Bengaluru deck, for a sponsor who wants the
// people who sit in both rooms: sharp minds and trained bodies. Everything
// Contrarian says about itself is in the shared partner brief; this deck is
// the co-branded case, so it stands on its own.
//
// Fight Club imagery is supplied by the club and lives in
// public/media/fight-club/. Until it lands the photo frames render broken, not
// crashed, so the deck can still be reviewed:
//   sparring.jpg   hero
//   community.jpg  the two-rooms right panel
//   training.jpg   the sponsor page
// Their wordmark is set as type here; swap in logo-light.svg when it arrives.

const instagramHandle = "thecontrarian.club";
const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;

export function FightClubBrief() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          className={styles.heroImage}
          src="/media/fight-club/sparring.jpg"
          alt="A Fight Club Bengaluru sparring session"
          width={1600}
          height={900}
          priority
        />
        <div className={styles.heroShade} />
        <nav className={styles.nav} aria-label="Brief navigation">
          <Image
            className={styles.logoLight}
            src="/media/contrarian-logo-light.svg"
            alt="The Contrarian Debate Club"
            width={745}
            height={346}
            priority
          />
          <span className={styles.lockupCross} aria-hidden="true">
            &times;
          </span>
          <span className={`${styles.fcMark} ${styles.navFcMark}`}>
            Fight Club
            <br />
            Bengaluru
          </span>
        </nav>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Partnership brief</p>
          <h1>Body and mind in the same room.</h1>
          <p className={styles.lead}>
            Contrarian runs Bengaluru&apos;s biggest debate nights. Fight Club
            trains the city&apos;s strikers and puts them in the ring. One
            evening built from both: the room spars, then it argues. The people
            who show up are the people a performance brand spends all year
            trying to reach.
          </p>
        </div>
        <p className={styles.scrollNote}>Bengaluru, India &middot; 2026</p>
      </section>

      <section className={styles.rooms} aria-label="The two clubs">
        <article className={styles.room}>
          <Image
            className={styles.roomImage}
            src="/media/room-listening.jpg"
            alt="A full Contrarian room following the debate"
            width={1600}
            height={1067}
          />
          <div className={styles.roomShade} />
          <p className={styles.roomKicker}>The argument</p>
          <h2>The Contrarian Debate Club</h2>
          <p>
            Live debate nights where the room votes on the motion, questions
            come from the floor, and the result is how many minds moved. Nine
            sold-out shows in the first four months.
          </p>
          <ul className={styles.roomFacts}>
            <li>600+ live attendees</li>
            <li>12.5K on Instagram</li>
            <li>1M+ content views</li>
          </ul>
        </article>
        <article className={styles.room}>
          <Image
            className={styles.roomImage}
            src="/media/fight-club/community.jpg"
            alt="A Fight Club Bengaluru training session"
            width={1600}
            height={1067}
          />
          <div className={styles.roomShade} />
          <p className={styles.roomKicker}>The ring</p>
          <h2 className={styles.fcMark}>Fight Club Bengaluru</h2>
          <p>
            Morning striking sessions at Concept01 Koramangala, run as numbered
            volumes. Each one drills a theme, from fundamentals to aggression
            and composure, and ends with everyone sparring.
          </p>
          <ul className={styles.roomFacts}>
            <li>10+ volumes run</li>
            <li>Weekly sessions</li>
            <li>Sparring every time</li>
          </ul>
        </article>
      </section>

      <section className={styles.format}>
        <div className={styles.formatIntro}>
          <p className={styles.sectionLabel}>The format</p>
          <h2>Train first. Then argue.</h2>
          <p className={styles.formatLead}>
            One night, run on the Contrarian spine, with a Fight Club session
            bolted to the front of it.
          </p>
        </div>
        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNumber}>01</span>
            <h3>The session</h3>
            <p>
              A Fight Club striking class opens the night: warm-up, drills on
              the evening&apos;s theme, and controlled sparring. Some in the
              room train, the rest watch it happen up close.
            </p>
          </li>
          <li>
            <span className={styles.stepNumber}>02</span>
            <h3>The room takes a side</h3>
            <p>
              A motion drawn from the world we just watched: whether aggression
              beats composure, whether pain is a good teacher, whether risking
              the body is worth it. Everyone votes before a word is said.
            </p>
          </li>
          <li>
            <span className={styles.stepNumber}>03</span>
            <h3>The debate</h3>
            <p>
              Contrarian&apos;s format: two sides hold the floor, the audience
              rebuts and asks, claims get checked on screen. Fighters and
              debaters in the same argument, which is a fight most rooms never
              get to see.
            </p>
          </li>
          <li>
            <span className={styles.stepNumber}>04</span>
            <h3>The room votes again</h3>
            <p>
              The swing between the two votes is the result. Then it becomes
              content: the motion, the best exchanges, the knockout line,
              published to both audiences.
            </p>
          </li>
        </ol>
      </section>

      <section className={styles.audience}>
        <div className={styles.audienceImageWrap}>
          <Image
            className={styles.audienceImage}
            src="/media/audience-contributing.jpg"
            alt="An audience member making a point at a Contrarian debate"
            width={1600}
            height={2000}
          />
        </div>
        <div>
          <p className={styles.sectionLabel}>Who is in the room</p>
          <h2>The people who train both.</h2>
          <dl className={styles.profileGrid}>
            <div>
              <dt>Age</dt>
              <dd>24 to 35</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>Bengaluru: Koramangala, Indiranagar, HSR</dd>
            </div>
            <div>
              <dt>Work</dt>
              <dd>Founders, operators, engineers, finance, creative</dd>
            </div>
            <div>
              <dt>Mindset</dt>
              <dd>Competitive, disciplined, high-agency</dd>
            </div>
            <div>
              <dt>Body</dt>
              <dd>Trains several times a week and takes it seriously</dd>
            </div>
            <div>
              <dt>Spend</dt>
              <dd>Well paid, and pays for gear, gym, recovery and health</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.reach}>
        <p className={styles.sectionLabel}>Combined reach</p>
        <div className={styles.reachRow}>
          <div className={styles.reachBand}>
            <p className={styles.reachBandName}>Contrarian</p>
            <article>
              <strong>12.5K</strong>
              <span>Instagram followers</span>
            </article>
            <article>
              <strong>600+</strong>
              <span>live attendees</span>
            </article>
            <article>
              <strong>1M+</strong>
              <span>content views</span>
            </article>
            <article>
              <strong>9</strong>
              <span>sold-out shows</span>
            </article>
          </div>
        </div>
        <div className={styles.reachRow}>
          <div className={styles.reachBand}>
            <p className={styles.reachBandName}>Fight Club</p>
            <article>
              <strong>10+</strong>
              <span>volumes run</span>
            </article>
            <article>
              <strong>Weekly</strong>
              <span>training sessions</span>
            </article>
            <article>
              <strong>Concept01</strong>
              <span>Koramangala home</span>
            </article>
            <article>
              <strong>100%</strong>
              <span>sessions end in sparring</span>
            </article>
          </div>
        </div>
        <p className={styles.reachNote}>
          Fight Club audience figures to be confirmed by the club and added
          here.
        </p>
      </section>

      <section className={styles.offer}>
        <div className={styles.offerImageWrap}>
          <Image
            className={styles.offerImage}
            src="/media/fight-club/training.jpg"
            alt="A Fight Club Bengaluru striking session in progress"
            width={1600}
            height={1067}
          />
        </div>
        <div className={styles.offerCopy}>
          <p className={styles.sectionLabel}>What a sponsor gets</p>
          <h2>One night. A physical room and a content engine.</h2>
          <p className={styles.offerLead}>
            You reach people who spend on performance, in the moment they care
            about it most.
          </p>
          <div className={styles.offerBlocks}>
            <article>
              <p className={styles.offerNumber}>01</p>
              <h3>In the room</h3>
              <p>
                Your brand on the mat and at the door: sampling, gear on the
                floor, a stand where the training happens. A captive room that
                just worked up a sweat.
              </p>
            </article>
            <article>
              <p className={styles.offerNumber}>02</p>
              <h3>In the content</h3>
              <p>
                The motion, the fact-checks and the clips carry you. Combat plus
                a real argument is unusually watchable, and it runs to both
                audiences after the night.
              </p>
            </article>
            <article>
              <p className={styles.offerNumber}>03</p>
              <h3>The fit</h3>
              <p>
                Apparel, nutrition, recovery, wearables, anything bought by
                people who optimise both mind and body. One night proves the
                audience; the content compounds it.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerMarks}>
          <Image
            className={styles.footerLogo}
            src="/media/contrarian-logo-light.svg"
            alt="The Contrarian Debate Club"
            width={745}
            height={346}
          />
          <span className={styles.footerCross} aria-hidden="true">
            &times;
          </span>
          <span className={`${styles.fcMark} ${styles.footerFcMark}`}>
            Fight Club Bengaluru
          </span>
        </div>
        <p>Sharper minds. Trained bodies. One room.</p>
        <a href={instagramUrl} target="_blank" rel="noreferrer">
          @{instagramHandle} <span aria-hidden="true">&#8599;</span>
        </a>
      </footer>
      <ExportPdfButton />
    </main>
  );
}
