# 0004 Admin Debate Assets Implementation Plan

> **For agentic workers:** Use the native implementation workflow in this workspace. Complete each checked step and commit verified, independent changes.

**Goal:** An admin can choose Generate assets for a debate and download one ZIP containing before, after, and swing PNG cards for every motion.

**Architecture:** A protected Next.js page queries only the event's scale poll data with the server Supabase client. A pure function matches pre and post votes by device within each topic and builds the card model. Client components render the existing Debate 10 visual format and capture each card as a 3200 by 1800 PNG, then place every PNG in one ZIP.

**Tech Stack:** Next.js 16.3.1, React 19, Supabase, Vitest, html-to-image, JSZip.

**Spec:** `docs/adr/0005-admin-debate-asset-export.md` and the user request in this conversation.

## Global Constraints

- Keep the existing Supabase Auth admin account model. Add no roles.
- Add a hamburger menu to each event in the admin event list, with Generate assets inside.
- Include every motion with a closed, revealed pre-debate and post-debate scale poll. If any motion is not ready, explain it and block the event ZIP instead of producing an incomplete set.
- Count only devices present in both rounds of each motion on all three cards.
- Calculate movement from scale values, including steps toward or away from zero. Compute average shift from unrounded totals and display two decimals.
- Never send device IDs or the Supabase secret key to the browser.
- Read the installed `node_modules/next/dist/docs/` guides before changing Next.js code.
- Do not edit the existing Debate 10 poster work or its uncommitted PNG files.
- Use no em dashes in generated text or code.

## Review Focus

- An unmatched vote changes the full round total but must not enter a card.
- A voter moving from zero toward a side counts as movement in that direction.
- Zero matched voters must produce a clear unavailable state, never `NaN`.
- One unready motion blocks the full event ZIP and identifies the motion.
- A long motion must wrap within the card and never clip its chart or caption.

### Task 1: Aggregate all motion results

**Files:** Create `src/lib/debate-assets.ts`, `src/lib/debate-assets.test.ts`, and `src/lib/debate-assets-server.ts`.

**Interfaces:** `buildDebateAssets(topics, activities, options, votes)` returns serializable motion card data and an unready reason per motion. `getDebateAssets(code)` requires an admin session, loads one event and its rows with pagination, and returns the aggregate model.

- [ ] Write unit tests for matched-only bins, movement, precision, unready polls, and zero matched voters. The production change that makes them fail is the missing pure aggregator.
- [ ] Run the focused test and verify it fails for the missing aggregator.
- [ ] Implement the pure aggregator and run the focused test until it passes.
- [ ] Add the server loader with an admin check before the service client, scoped queries by event and activity IDs, and paginated vote reads.
- [ ] Run the full test suite, lint, and typecheck. Commit the aggregate feature.

### Task 2: Add the admin entry and protected page

**Files:** Modify `src/app/admin/page.tsx`; create `src/components/admin-event-menu.tsx` and `src/app/admin/events/[code]/assets/page.tsx`.

**Interfaces:** The event menu links to the admin-host-aware assets route. The page calls `getDebateAssets(code)` and passes only the aggregate result to the client renderer.

- [ ] Write a menu interaction test for opening and closing the menu and its Generate assets link.
- [ ] Run the focused test and verify it fails for the missing menu.
- [ ] Implement the accessible per-event menu and add it to the list.
- [ ] Implement the protected assets page with status and readiness text.
- [ ] Run tests, lint, and typecheck. Commit the admin navigation feature.

### Task 3: Render and download the cards

**Files:** Create `src/components/debate-assets/asset-card.tsx`, `src/components/debate-assets/asset-card.module.css`, `src/components/debate-assets/asset-exporter.tsx`; modify `package.json` and `package-lock.json`.

**Interfaces:** The card renders a fixed 1600 by 900 canvas from one motion and stage. The exporter captures it at a pixel ratio of 2 and puts three PNGs per motion in an event-named ZIP.

- [ ] Write a component test for the three cards and filenames per ready motion and for a blocked download when a motion is unready.
- [ ] Run the focused test and verify it fails for the missing renderer/exporter.
- [ ] Install `html-to-image` and `jszip`, then implement the card layout from the existing Debate 10 HTML and the ZIP download.
- [ ] Run tests, lint, typecheck, and build. Commit the export feature.

### Task 4: Verify real output

**Files:** Save browser screenshots only under `.context/`; update `README.md` with the admin export route and account provision note.

- [ ] Load the page in a browser with a test/admin session and inspect every Debate 10 card, or use an isolated fixture page if production access is unavailable.
- [ ] Export a ZIP and verify six PNGs, each 3200 by 1800, and compare their composition and numbers with the committed Debate 10 outputs.
- [ ] Verify incomplete events explain why export is blocked.
- [ ] Run the final test suite, lint, typecheck, and build. Commit the documentation and any verified fixes.
