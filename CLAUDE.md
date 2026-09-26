@AGENTS.md

# Writing style

Never use em dashes (—) anywhere: code, comments, commit messages, prose, or poster/marketing copy. Use periods, commas, colons, or parentheses instead. This applies to all generated text in this repo.

# Posters and carousels

Everything the club publishes as an image is made in `posters/`, a standalone Vite studio with its own dependencies. Read `posters/README.md` before touching it.

It has two layers, and the split matters:

- `posters/src/core/` is the design system (brand tokens, templates, formats). Stable and event-agnostic.
- `posters/works/` is the archive. One self-contained folder per poster or carousel, named `<yyyy-mm-dd>-<slug>`, holding its `spec.ts`, its own `assets/` and its committed `out/`. Adding a poster means adding a folder: nothing registers it.

Never edit `src/core/` to solve one event's problem. If a poster needs something the templates cannot do, that is a template change and it has to be right for every future poster too.

## Avoid AI design tells

Everything the club publishes has to look made by a person. Each pattern below was tried on the Debate #11 poster and carousel and made them read as AI-generated, so do not use them:

- Decorative frames or double hairline borders drawn over the art. Let pictures run to the edge.
- A tick or short dash before a label ("— THEME"). Set the label plainly.
- Wide-tracked uppercase on every small line. Counters, sources, credits and format lines are sentence case with no tracking. Tracked caps go on one element at most, usually the call to action.
- Gold on everything. Gold marks one thing per slide: the call to action, or the single line the slide exists for.
- A soft glow behind type (a wide blurred `text-shadow`). Put a dark fade under the text and keep any shadow to 1 or 2px.
- Rules and seams that fade out in a gradient. Use a plain hairline, or nothing.
- Stock "elegant" flourishes: roman numerals, gold italic lines, ornamental dividers.
- Mock interface: rounded cards with soft drop shadows, placeholder avatar circles, platform badges in the corner. A post is either a real screenshot or cut-out paper (square or torn edge, slight tilt, short real shadow).
- The same composition on every slide of a carousel. Vary at least two slides.
- One colour filter over every photograph. Photos stay close to their own colour; only paintings get the warm treatment.

Never invent a quote, post or statistic. Posts are quoted exactly from a published source that is printed on the slide, and private people's names and handles are struck out.
