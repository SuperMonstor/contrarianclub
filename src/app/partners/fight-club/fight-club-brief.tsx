import Image from "next/image";

import { ExportPdfButton } from "../export-pdf-button";
import styles from "./fight-club.module.css";

// The Contrarian x Fight Club Bengaluru deck, for a sponsor who wants the
// people who sit in both rooms: sharp minds and trained bodies. Everything
// Contrarian says about itself is in the shared partner brief; this deck is
// the co-branded case, so it stands on its own.
//
// Fight Club imagery lives in public/media/fight-club/ and is still cropped
// from Instagram, so all of it is placeholder:
//   sparring.jpg     hero background
//   community.jpg    the two-rooms right panel
//   venue-crowd.jpg  the "one roof" page
//   session.jpg      the "inside Fight Club" page
//   venue-hall.jpg   spare
//   logo.png         the crest in the lockup and footer
// Everything Contrarian is a real photograph from public/media/.

const instagramHandle = "thecontrarian.club";
const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;

export function FightClubBrief() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPanel}>
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
            <Image
              className={styles.navCrest}
              src="/media/fight-club/logo.png"
              alt="Fight Club Bengaluru"
              width={280}
              height={292}
              priority
            />
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Partnership brief</p>
            <h1>Body and mind in the same room.</h1>
            <p className={styles.lead}>
              Contrarian Club runs Bangalore&apos;s debate events. Fight Club
              brings people together for a taste of combat. One evening built
              from both: the room argues, then it settles it with the gloves on.
              Everyone who shows up performs, intellectually and physically.
            </p>
          </div>
          <p className={styles.scrollNote}>Bangalore, India &middot; 2026</p>
        </div>
        <div className={styles.heroFrames}>
          <figure>
            <Image
              src="/media/stage-and-poll.jpg"
              alt="Two Contrarian Club speakers on stage, the audience poll on the screen behind them"
              width={1600}
              height={1067}
              priority
            />
            <figcaption>Contrarian Club</figcaption>
          </figure>
          <figure>
            <Image
              src="/media/fight-club/sparring.jpg"
              alt="A Fight Club Bengaluru sparring session"
              width={1600}
              height={900}
              priority
            />
            <figcaption>Fight Club Bengaluru</figcaption>
          </figure>
        </div>
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
          <h2>Contrarian Club</h2>
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
          <p className={styles.roomKicker}>The combat</p>
          <h2 className={styles.fcMark}>Fight Club Bengaluru</h2>
          <p>
            Striking sessions at Concept01 Koramangala, run as numbered volumes.
            Each drills a theme, from fundamentals to aggression and composure,
            and ends with everyone sparring. A room that comes to taste combat.
          </p>
          <ul className={styles.roomFacts}>
            <li>14 volumes run</li>
            <li>Weekly sessions</li>
            <li>Sparring every time</li>
          </ul>
        </article>
      </section>

      <section className={styles.gallery} aria-label="Contrarian Club rooms">
        <div className={styles.galleryCopy}>
          <p className={styles.sectionLabel}>What we already fill</p>
          <h2>Nine sold-out rooms in four months.</h2>
          <p>
            This is the audience Fight Club would be walking into. Bangalore
            professionals who buy a ticket to spend an evening arguing, and who
            keep coming back.
          </p>
          <p className={styles.galleryCredits}>
            <span>Also staged at</span>
            Elevation Capital Basecamp &middot; Bengaluru Tech Week
          </p>
        </div>
        <div className={styles.galleryGrid}>
          <figure>
            <Image
              src="/media/speaker-addressing-room.jpg"
              alt="A Contrarian Club speaker addressing a full room"
              width={1600}
              height={1067}
            />
          </figure>
          <figure>
            <Image
              src="/media/attendees-watching.jpg"
              alt="Contrarian Club attendees watching the debate"
              width={1600}
              height={1067}
            />
          </figure>
          <figure>
            <Image
              src="/media/speaker-and-audience.jpg"
              alt="A speaker making a point to the Contrarian Club audience"
              width={1600}
              height={1067}
            />
          </figure>
          <figure>
            <Image
              src="/media/room-and-screen.jpg"
              alt="The Contrarian Club room, the live poll on the screen behind the stage"
              width={1600}
              height={1067}
            />
          </figure>
        </div>
      </section>

      <section className={styles.venue}>
        <Image
          className={styles.venueImage}
          src="/media/fight-club/venue-crowd.jpg"
          alt="A room at Concept01 Koramangala gathered in the dark, watching the screen"
          width={1600}
          height={1178}
        />
        <div className={styles.venueShade} />
        <div className={styles.venueCopy}>
          <p className={styles.sectionLabel}>One roof</p>
          <h2>The same room, twice over.</h2>
          <p>
            Fight Club already trains at Concept01 in Koramangala. It is a dark,
            raw, concrete room that takes a crowd and holds a stage. Both halves
            of the night happen in it, back to back, with nobody moving venue.
          </p>
        </div>
      </section>

      <section className={styles.format}>
        <div className={styles.formatIntro}>
          <p className={styles.sectionLabel}>The format</p>
          {/* non-breaking space: never leave "it." alone on its own line */}
          <h2>Argue. Then settle&nbsp;it.</h2>
          <p className={styles.formatLead}>
            Talk until talking runs out. Then put the gloves on.
          </p>
        </div>
        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNumber}>01</span>
            <h3>The room argues</h3>
            <p>
              A motion is put to the room. Two people take opposite sides, the
              floor joins in, everyone votes first. Standard Contrarian rules.
            </p>
          </li>
          <li>
            <span className={styles.stepNumber}>02</span>
            <h3>Someone calls it</h3>
            <p>
              When the argument stops moving, or starts to boil over, either
              side can call it. Enough talking. Gloves on.
            </p>
          </li>
          <li>
            <span className={styles.stepNumber}>03</span>
            <h3>They glove up</h3>
            <p>
              Fight Club takes over. Gloves, headgear, a referee and a few short
              rounds on the mat. The disagreement gets worked out with hands
              instead of words.
            </p>
          </li>
          <li>
            <span className={styles.stepNumber}>04</span>
            <h3>Next round</h3>
            <p>
              Back to the floor. New motion, new pairing. The room votes again
              at the end, and the swing between the votes is the result.
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
              <dd>Bangalore: Koramangala, Indiranagar, HSR</dd>
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
              <strong>14</strong>
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

      <section className={styles.inside}>
        <div className={styles.insideImageWrap}>
          <Image
            className={styles.insideImage}
            src="/media/fight-club/session.jpg"
            alt="Gloves up during sparring at the end of a Fight Club session"
            width={1600}
            height={1478}
          />
        </div>
        <div className={styles.insideCopy}>
          <p className={styles.sectionLabel}>Inside Fight Club</p>
          <h2>Fourteen volumes of people learning to fight.</h2>
          <p className={styles.insideLead}>
            Not a gym with a membership. A room that gathers, drills one idea,
            and spars.
          </p>
          <div className={styles.insideBlocks}>
            <article>
              <p className={styles.insideNumber}>01</p>
              <h3>How a session runs</h3>
              <p>
                Eleven in the morning at Concept01, Koramangala. A warm-up, then
                an hour on the volume&apos;s theme, then everyone gloves up and
                spars. Coaches run it from the floor.
              </p>
            </article>
            <article>
              <p className={styles.insideNumber}>02</p>
              <h3>One idea per volume</h3>
              <p>
                Vol 08 drilled aggression and composure in striking. Vol 10 went
                back to the fundamentals. Each one is announced, ticketed and
                numbered, and the next picks a new theme.
              </p>
            </article>
            <article>
              <p className={styles.insideNumber}>03</p>
              <h3>Who turns up</h3>
              <p>
                Regulars and first-timers on the same mat, most of them there to
                try the real thing without signing up to a fight gym. It is the
                nearest thing Bangalore has to a combat sports social.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.poll}>
        <div className={styles.pollCopy}>
          <p className={styles.sectionLabel}>Beyond impressions</p>
          <h2>Ask the room anything.</h2>
          <p className={styles.pollLead}>
            Every Contrarian night already runs on live audience voting. For one
            night, that machinery is yours.
          </p>
          <div className={styles.pollBlocks}>
            <article>
              <h3>Put your question to the floor</h3>
              <p>
                The room votes from their phones, the result lands on the screen
                behind the stage, and everyone watches the number move. Your
                question sits in the run of play, not in a survey nobody opens.
              </p>
            </article>
            <article>
              <h3>Keep the answers</h3>
              <p>
                You get the results the next morning: a clean read on what a
                room of high-earning, fitness-minded professionals actually
                thinks. That is first-party research on your target market, not
                an impression count.
              </p>
            </article>
          </div>
        </div>
        <div className={styles.pollImageWrap}>
          <Image
            className={styles.pollImage}
            src="/media/speaker-with-phone.jpg"
            alt="A Contrarian Club speaker at the mic, phone in hand"
            width={1600}
            height={1067}
          />
        </div>
      </section>

      <section className={styles.proposal}>
        <div className={styles.proposalHead}>
          <p className={styles.sectionLabel}>The proposal</p>
          <h2>Mid-October. Concept01.</h2>
          <p className={styles.proposalLead}>
            One night to prove it, then a series if it lands.
          </p>
        </div>
        <div className={styles.proposalBlocks}>
          <article>
            <p className={styles.proposalNumber}>01</p>
            <h3>The date</h3>
            <p>
              Mid-October 2026 at Concept01, Koramangala. Roughly five weeks to
              build the night, sell the room and shoot it properly.
            </p>
          </article>
          <article>
            <p className={styles.proposalNumber}>02</p>
            <h3>Category exclusivity</h3>
            <p>
              One performance brand in the room. Nothing competing on the floor,
              in the content, or on the night.
            </p>
          </article>
          <article>
            <p className={styles.proposalNumber}>03</p>
            <h3>What happens next</h3>
            <p>
              Commercials as discussed separately. Say yes and we lock the date,
              name the series, and start building it with Fight Club.
            </p>
          </article>
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
          <Image
            className={styles.footerCrest}
            src="/media/fight-club/logo.png"
            alt="Fight Club Bengaluru"
            width={280}
            height={292}
          />
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
