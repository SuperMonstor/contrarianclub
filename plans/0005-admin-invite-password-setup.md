# 0005 Admin Invite Password Setup

**Goal:** Invite `rajathmagaji@gmail.com` to the existing Supabase Auth admin group and let him choose a password before using the current admin login.

**Decision:** Add a public admin-host password setup page. It uses a temporary browser-only Supabase client configured for the implicit invite token, confirms the signed-in invited user, updates that user's password, signs out, and sends them to the existing login. No roles or public signup are added.

**Prerequisite:** Add `https://admin.thecontrarian.club/set-password` to the Supabase Auth redirect allow list. Deploy the page before sending an invite, since invite links can expire.

## Implementation

- [ ] Test invalid or expired invite state, password mismatch, successful password update, and sign-out routing.
- [ ] Add the password setup page and client form without exposing the service key.
- [ ] Verify the page in a browser with a mocked invite session and run tests, lint, typecheck, and build.
- [ ] Check redirect configuration and deploy the verified code after approval for any credit-consuming operation.
- [ ] Send the Supabase invitation to the specified email with the admin-host redirect, then verify the user appears as invited.

## Limits

- The editor must click the email link and choose a password. We cannot complete that action for him.
- If the project rejects the redirect URL, correct the Supabase Auth allow list before sending the invite.
