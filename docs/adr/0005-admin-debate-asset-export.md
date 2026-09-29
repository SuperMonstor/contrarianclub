# ADR 0005: Admin Debate Asset Export

## Context

Debate vote cards are currently made from a manual Supabase snapshot in a
standalone HTML file and exported with a local Playwright script. An editor
needs to generate the same before, after, and swing cards for every motion in
an event from the admin panel.

## Decision

Add a Generate assets entry to each event's menu in the existing admin event
list. The new page uses the current Supabase Auth admin check. It reads closed,
revealed pre-debate and post-debate scale polls on the server, matches voters
within each motion, and sends only aggregate card data to the browser. The
browser renders the cards and downloads all of an event's PNGs as one ZIP.

This feature reads current vote data when the page loads. It does not store a
new results snapshot or add account roles. Admin accounts continue to be
provisioned through Supabase Auth.

## Consequences

Editors with admin accounts can also use the existing admin controls. Exports
can change if votes change after the page loads, so the page shows the read
time and the user must reload to generate from newer data. No browser runtime
or screenshot service is needed in the deployed application.
