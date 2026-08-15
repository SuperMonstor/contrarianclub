# 0002 YouTube Thumbnail Generator

## Summary

Add `npm run thumb <youtube-url>` to the poster studio. It downloads the video,
picks the best speaker frames, drafts candidate lines from the transcript, cuts
the subject out of the chosen frames, and scaffolds a work folder. The studio
and the existing export CLI then render several layout variations at 1280x720
so a human picks one.

Design decisions and their reasoning are in `docs/adr/0002-youtube-thumbnail-pipeline.md`.

## Shape

```
posters/
  thumb.ts                     the new CLI. Downloads, extracts, drafts, scaffolds.
  thumbnail/
    layouts.tsx                the variation layouts, shared across every video
    thumbnail.css              cutout rim, thumbnail scrims
    scaffold.ts                writes works/<id>/ from a resolved brief
  src/core/formats.ts          gains one entry: yt-thumb, 1280x720
  .cache/                      gitignored: downloads, frames, the removal model
```

`thumb.ts` never renders and `export.ts` never downloads. The handoff between
them is the scaffolded work folder.

## Pipeline

1. **Preflight.** Check `yt-dlp` and `ffmpeg` are on PATH and that Anthropic
   credentials resolve. Fail with a single clear message naming what is missing.
2. **Ingest.** `yt-dlp` pulls a 720p stream and auto-captions into
   `.cache/<videoId>/`. Skip the download when the cache already has it.
3. **Contact sheet.** `ffmpeg` samples a frame every N seconds into a grid with
   timecodes burned in, sized so the long edge stays under 2576px.
4. **Frame pass.** Send the sheet to `claude-opus-5` as a base64 image block and
   ask for 4 to 6 timestamps where a face is large, frontal, eyes open, not
   mid-blink and not motion blurred. Constrain the reply with
   `client.messages.parse()` and a zod schema of `{ timecode, why }`.
5. **Extract.** `ffmpeg` re-extracts those timestamps at full resolution.
6. **Copy pass.** Send the transcript to `claude-opus-5` and ask for 5 candidate
   lines: two to four words, short declaratives, dry, no em dashes, no hype, no
   emoji. Print them numbered to the terminal.
7. **Cutout.** Run `@imgly/background-removal-node` on each extracted frame,
   writing both the cutout PNG and the original JPEG into the work's `assets/`.
   The dependency and its model load lazily, only on this step.
8. **Scaffold.** Write `works/<yyyy-mm-dd>-<slug>-thumb/` with `assets/`
   populated and a `spec.tsx` pre-filled with the chosen line, then print the
   export command.

## Layout variations

One work, several slides, all declaring `formats: ["yt-thumb"]`, so a single
export gives the whole sheet:

- cutout right, text left
- cutout left, text right
- two-speaker split, when the frame pass reports two faces
- full frame with scrim, text centered
- full frame with scrim, text lower third

The visual grammar goes at the top of `layouts.tsx`: which composition each
variation uses and what it is for.

## Text selection

The tool suggests, the human chooses. `npm run thumb <url>` prints the
candidate lines and stops. `npm run thumb <url> --line "..."` (or `--line 3` to
pick a printed candidate) runs the cutout and scaffold steps with that line.
Rerunning with a different line rewrites `spec.tsx` and leaves the assets alone.

## Implementation changes

- Add the `yt-thumb` format to `src/core/formats.ts` and its row to the format
  table in `posters/README.md`.
- Add `thumb` to the scripts in `posters/package.json`, run through `tsx` like
  `poster`.
- Add `@anthropic-ai/sdk` as a dependency and `@imgly/background-removal-node`
  as an optional dependency so a plain `npm install` does not fetch the model.
- Add `.cache/` to `posters/.gitignore`.
- Write `thumbnail/layouts.tsx`, `thumbnail/thumbnail.css` and
  `thumbnail/scaffold.ts`.
- Write `thumb.ts`: preflight, ingest, contact sheet, frame pass, extract, copy
  pass, cutout, scaffold.
- Add a short section to `posters/README.md` covering the thumbnail flow and
  saying plainly that thumbnail works are re-runnable, unlike posters.

## Tests and acceptance criteria

- `npm run dev` and `npm run poster <existing-work>` behave exactly as before,
  on a checkout where the background-removal model was never fetched.
- Preflight names the missing tool when `yt-dlp`, `ffmpeg` or credentials are
  absent, and does not download anything.
- A second run against the same URL reuses the cache and skips the download.
- The frame pass returns timestamps that resolve to real frames in the video,
  and every returned timestamp extracts without error.
- The copy pass output contains no em dashes, no exclamation marks and no emoji.
- The scaffolded work exports through `npm run poster <id> yt-thumb` with no
  edits, producing one 2560x1440 file per variation.
- **Look at the exported files.** These are visual artifacts and the code will
  not tell you whether they read at thumbnail size. Check them at the size
  YouTube actually shows them.
- `git status` after a full run shows only the work folder, never the cache.

## Assumptions

- Videos are club recordings with one or two speakers on screen.
- Auto-captions are good enough for line drafting. If they are missing, the copy
  pass is skipped and `--line` becomes required.
- The chosen line is always a human decision. The tool never picks one silently.
- Thumbnails are re-cut over time, so a thumbnail work folder may be regenerated
  after it ships.
