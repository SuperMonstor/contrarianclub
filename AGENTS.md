<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Writing style

Never use em dashes (—) anywhere: code, comments, commit messages, prose, or poster/marketing copy. Use periods, commas, colons, or parentheses instead. This applies to all generated text in this repo.

# Agent workflow

- Keep ADRs brief, direct, and easy to understand. Record the context,
  decision, and consequences without unnecessary explanation.
- Create an ADR before implementing a new long-lived decision that changes
  architecture, supported platforms, persisted data or compatibility, security
  or privacy boundaries, external providers, or release and distribution
  policy. Do not create ADRs for routine implementation details or bug fixes
  that preserve accepted decisions.
- Update the existing ADR when refining or changing the same decision. Create
  the next sequential ADR only for a distinct decision, and state which earlier
  ADRs it extends or supersedes.
- Make atomic git commits regularly. Commit whenever each small feature is
  complete and verified so it can be reverted cleanly.
- Prefix implementation plan filenames and titles in `plans/` with the next
  sequential four-digit number, such as `0003-example.md`.
- When a task has an implementation plan, write the finalized plan into
  `plans/` before beginning implementation.
- Never trigger GitHub Actions or another paid or credit-consuming service
  without the user's explicit consent for that specific operation. State the
  expected jobs and usage or cost before requesting consent.
