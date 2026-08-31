import Image from "next/image";

import type { PartnerDeck } from "@/content/partner-decks";

import { ExportPdfButton } from "./export-pdf-button";
import styles from "./page.module.css";

const instagramHandle = "thecontrarian.club";
const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;

// The deck. Everything in it is true of the club whoever is reading it. The
// partner-specific piece is the pair of pitch pages after "why partner", which
// is why it is a prop (see src/content/partner-decks.ts). With no partner, this
// is the general brief.
export function PartnerBrief({ partner }: { partner?: PartnerDeck }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          className={styles.heroImage}
          src="/media/speaker-addressing-room.jpg"
          alt="A Contrarian Debate Club speaker addressing the room"
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
        </nav>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Partnership brief</p>
          <h1>A room built for people who have something to say.</h1>
          <p className={styles.lead}>
            Contrarian started as a plan for eight or nine friends to spend an
            evening arguing well. Two months later, it is becoming a live
            debate and content platform for sharp ideas, spirited disagreement
            and conversations that travel far beyond the room.
          </p>
          <a className={styles.heroCta} href={instagramUrl} target="_blank" rel="noreferrer">
            Explore the club on Instagram <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className={styles.scrollNote}>Bengaluru, India · 2026</p>
      </section>

      <div className={styles.tractionPage}>
        <section className={styles.intro}>
          <p className={styles.sectionLabel}>The story</p>
          <div className={styles.storyGrid}>
            <h2>It was supposed to be a small night out. It became a scene.</h2>
            <div>
              <p>
                We originally planned Contrarian for eight or nine friends. Then
                we put out our first reel, which reached <strong>80K views</strong>,
                and saw <strong>demand for 110 tickets in under 12 hours</strong>.
              </p>
              <p>
                We have now sold out <strong>eight shows</strong>.
                The live debate is the starting point. <mark className={styles.highlight}>We
                turn the best arguments, prompts and moments into content that
                brings new people into the conversation</mark>, then back into
                the next room.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.stats} aria-label="Progress in two months">
          <p className={styles.statsHeading}>Progress in 2 months</p>
          <div className={styles.statsGrid}>
            <article>
              <strong>&gt;500</strong>
              <span>live attendees</span>
            </article>
            <article>
              <strong>&gt;1M</strong>
              <span>views</span>
            </article>
            <article>
              <strong>8</strong>
              <span>sold-out shows</span>
            </article>
          </div>
        </section>
      </div>

      <section className={styles.elevation}>
        <div className={styles.elevationAside}>
          <p className={styles.sectionLabel}>Coming next</p>
          <p className={styles.elevationKicker}>Part of</p>
          <div className={styles.elevationLockup} aria-label="Elevation Capital">
            <span className={styles.elevationMark} aria-hidden="true"><i /><i /></span>
            <span>Elevation<br />Capital</span>
          </div>
          <p className={styles.elevationEvent}>Basecamp · 6–12 August</p>
          <div className={styles.techWeekLockup}>
            Bengaluru<br />Tech Week
          </div>
          <p className={styles.elevationEvent}>1–6 September</p>
        </div>
        <div>
          <h2>Contrarian at Basecamp<br />and Bengaluru Tech Week.</h2>
          <p>
            This month we bring the Contrarian room to Basecamp, Elevation
            Capital&apos;s founder week, and in September we join Bengaluru Tech
            Week, the citywide festival that gathers more than 10,000 builders,
            founders and investors. Both put the format in front of exactly the
            people it is built for. Beyond Bengaluru, we are also planning
            future live events in more cities, taking the format to the wider
            community already engaging with our content.
          </p>
        </div>
      </section>

      <section className={styles.audience}>
        <div className={styles.audienceImageWrap}>
          <Image
            className={styles.audienceImage}
            src="/media/audience-contributing.jpg"
            alt="An audience member contributing to the debate"
            width={1600}
            height={900}
          />
        </div>
        <div className={styles.audienceCopy}>
          <p className={styles.sectionLabel}>Your potential reach</p>
          <h2>Bengaluru&apos;s top 1% intellectual community.</h2>
          <dl className={styles.profileGrid}>
            <div>
              <dt>Age</dt>
              <dd>25–35</dd>
            </div>
            <div>
              <dt>Live events</dt>
              <dd>Bengaluru</dd>
            </div>
            <div>
              <dt>Content reach</dt>
              <dd>Bengaluru, Hyderabad, Mumbai and Delhi</dd>
            </div>
            <div>
              <dt>Mindset</dt>
              <dd>Curious, opinionated, high-agency and AI-fluent</dd>
            </div>
            <div>
              <dt>Spending power</dt>
              <dd>Well-compensated young professionals</dd>
            </div>
            <div>
              <dt>Work</dt>
              <dd>Technology, startups, design, consulting and creative fields</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.fit}>
        <div className={styles.fitTop}>
          <p className={styles.sectionLabel}>Why partner with Contrarian</p>
          {partner && (
            <p className={styles.fitLockup}>
              <span className={styles.fitPartnerMark}>{partner.name}</span>
              <span className={styles.fitLockupCross} aria-hidden="true">
                ×
              </span>
              <Image
                src="/media/contrarian-logo-light.svg"
                alt="The Contrarian Debate Club"
                width={745}
                height={346}
              />
            </p>
          )}
          <h2>One partnership. A live room and a content engine.</h2>
          <p className={styles.fitLead}>
            Rare access to a high-trust live room. Then everything we publish
            carries it.
          </p>
        </div>
        <div className={styles.fitPanels}>
          <figure>
            <Image
              src="/media/room-listening.jpg"
              alt="A full Contrarian room following the debate"
              width={1600}
              height={1067}
            />
            <figcaption>
              <strong>The live room</strong>
              <span>Eight sold-out debates and counting.</span>
            </figcaption>
          </figure>
          <figure>
            <Image
              src="/media/filming-the-room.jpg"
              alt="A camera filming the room mid-debate"
              width={1600}
              height={1067}
            />
            <figcaption>
              <strong>The content engine</strong>
              <span>Every debate filmed. More than a million views.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {partner?.pitch.map((page) =>
        page.kind === "evidence" ? (
          <section key={page.heading} className={styles.evidence}>
            <Image
              className={styles.evidenceImage}
              style={{ objectPosition: page.image.focus }}
              src={page.image.src}
              alt={page.image.alt}
              width={1600}
              height={1067}
            />
            <div className={styles.evidenceShade} />
            <div className={styles.evidenceCopy}>
              <p className={styles.sectionLabel}>{page.label}</p>
              <h2>{page.heading}</h2>
              <p className={styles.evidenceLead}>{page.lead}</p>
              <p className={styles.evidenceKicker}>{page.kicker}</p>
            </div>
            <ul className={`${styles.chips} ${styles.evidenceItems}`}>
              {page.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : (
          <section key={page.heading} className={styles.offer}>
            <div className={styles.offerImageWrap}>
              <Image
                className={styles.offerImage}
                style={{ objectPosition: page.image.focus }}
                src={page.image.src}
                alt={page.image.alt}
                width={1600}
                height={1067}
              />
            </div>
            <div className={styles.offerCopy}>
              <p className={styles.sectionLabel}>{page.label}</p>
              <h2>{page.heading}</h2>
              <p className={styles.offerLead}>{page.lead}</p>
              <div className={styles.offerBlocks}>
                {page.blocks.map((block, index) => (
                  <article key={block.title}>
                    <p className={styles.offerNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3>{block.title}</h3>
                    <p>{block.body}</p>
                    <ul className={styles.chips}>
                      {block.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ),
      )}

      <section className={styles.socialProof}>
        <div className={styles.instagramFrame}>
          <Image
            src="/media/instagram-post-16.png"
            alt="A Contrarian Debate Club post from Instagram"
            width={1080}
            height={1350}
          />
        </div>
        <div className={styles.socialCopy}>
          <p className={styles.sectionLabel}>On Instagram</p>
          <h2>The debate does not end when the room empties.</h2>
          <p>
            Our Instagram is both the front door and the afterparty: debate
            prompts, provocative points of view, event moments and the content
            that keeps an argument alive between shows.
          </p>
          <a className={styles.instagramLink} href={instagramUrl} target="_blank" rel="noreferrer">
            Review @{instagramHandle} on Instagram <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className={styles.gallery}>
        <div className={styles.galleryHeader}>
          <div>
            <p className={styles.sectionLabel}>The room</p>
            <h2>Ideas land differently when they are live.</h2>
          </div>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            See more on Instagram <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className={styles.galleryGrid}>
          <Image
            className={styles.galleryWide}
            src="/media/speaker-and-audience.jpg"
            alt="A speaker facing a gathered Contrarian Debate Club audience"
            width={1600}
            height={900}
          />
          <Image
            className={styles.galleryTall}
            src="/media/attendees-watching.jpg"
            alt="Attendees watching the debate closely"
            width={1600}
            height={900}
          />
        </div>
      </section>

      <footer className={styles.footer}>
        <Image
          className={styles.logoDark}
          src="/media/contrarian-logo-dark.svg"
          alt="The Contrarian Debate Club"
          width={1007}
          height={417}
        />
        <Image
          className={styles.logoLightFooter}
          src="/media/contrarian-logo-light.svg"
          alt="The Contrarian Debate Club"
          width={745}
          height={346}
        />
        <p>A partnership built around sharper questions.</p>
        <a href={instagramUrl} target="_blank" rel="noreferrer">
          @{instagramHandle} <span aria-hidden="true">↗</span>
        </a>
      </footer>
      <ExportPdfButton />
    </main>
  );
}
