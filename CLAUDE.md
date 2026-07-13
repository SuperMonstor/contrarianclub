@AGENTS.md

# Writing style

Never use em dashes (—) anywhere: code, comments, commit messages, prose, or poster/marketing copy. Use periods, commas, colons, or parentheses instead. This applies to all generated text in this repo.

# Posters and carousels

Everything the club publishes as an image is made in `posters/`, a standalone Vite studio with its own dependencies. Read `posters/README.md` before touching it.

It has two layers, and the split matters:

- `posters/src/core/` is the design system (brand tokens, templates, formats). Stable and event-agnostic.
- `posters/works/` is the archive. One self-contained folder per poster or carousel, named `<yyyy-mm-dd>-<slug>`, holding its `spec.ts`, its own `assets/` and its committed `out/`. Adding a poster means adding a folder: nothing registers it.

Never edit `src/core/` to solve one event's problem. If a poster needs something the templates cannot do, that is a template change and it has to be right for every future poster too.
