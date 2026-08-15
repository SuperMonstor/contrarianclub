# ADR 0002: YouTube Thumbnail Pipeline

## Context

The club publishes debate recordings on YouTube and needs thumbnails that match
the gallery-at-night aesthetic: a speaker still or cutout with a short line of
text. Making these by hand per video is slow, and doing it outside the repo
would fork the brand surface a third time (the website and `posters/` already
sync tokens by hand).

The work is video processing: it shells out to `yt-dlp` and `ffmpeg`, downloads
a background-removal model, and caches video files. None of that resembles the
Next.js site or the poster archive. It is also templated by nature, which is
the opposite of the `posters/README.md` rule that every work is designed from
its own question.

## Decision

The thumbnail tool lives in `posters/` as a second CLI, `npm run thumb <url>`,
beside the existing `npm run poster`.

`src/core/` gains exactly one addition: a `yt-thumb` 1280x720 format. Thumbnail
layouts, the cutout treatment and thumbnail scrims live in a new
`posters/thumbnail/` layer that works import from, so the templated shape never
leaks into the design system.

`thumb.ts` never renders. It downloads, extracts frames, proposes copy, and
scaffolds a work folder. Rendering stays with the studio and `export.ts`, so
thumbnails preview live and export exactly like any other work.

Claude does two jobs in the pipeline: picking candidate frames from a contact
sheet, and drafting candidate lines from the transcript. Both go through the
official Anthropic TypeScript SDK on `claude-opus-5`.

Downloads, extracted frames and the background-removal model are gitignored.
The video dependencies load lazily so `npm run dev` and `npm run poster` are
unaffected when the model was never fetched.

Thumbnail works are re-runnable. Unlike posters, which are finished once
shipped, a thumbnail gets re-cut when a video underperforms.

## Consequences

Thumbnails inherit the brand tokens, fonts, logo and export pipeline with no
duplication, and archive under `works/` alongside posters.

The repo now depends on `yt-dlp` and `ffmpeg` being installed, and on an
Anthropic API key for the frame and copy passes. All three are checked at
startup with a clear message rather than failing mid-run.

`posters/` stops being purely a design archive. The re-runnable exception is
stated here so the archive rule is not eroded silently.

If the tool later grows a server, a queue or a hosted UI, it becomes a product
and should leave the repo. At that point `src/core/` is published as a package
and both consumers import it. This ADR would be superseded, not amended.
