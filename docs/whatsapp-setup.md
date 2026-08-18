# WhatsApp Marketing Setup

This guide connects Contrarian Club directly to Meta's WhatsApp Cloud API. It
does not use Twilio or a WhatsApp marketing platform.

Meta changes labels and review requirements regularly. If a label differs,
look for the closest equivalent under Business Settings, WhatsApp Manager, or
the app's WhatsApp product. Check Meta's current documentation before entering
production.

## What you need

- A Facebook account controlled by the person responsible for Contrarian Club.
- Two-factor authentication enabled on that Facebook account.
- A Meta Business Portfolio for Contrarian Club.
- A dedicated Indian mobile number that can receive an SMS or voice call.
- Access to the production Supabase project and deployment environment.
- A public HTTPS deployment for the webhook.
- A published privacy notice. This application provides `/privacy` as a basic
  notice and opt-out explanation. Review it before production.

Do not use a personal WhatsApp number. Start with a number that is not currently
registered in the WhatsApp or WhatsApp Business mobile app. This keeps the API
identity independent and avoids migration or coexistence complications.

## Part 1: Create the Meta business and app

1. Sign in to [Meta Business](https://business.facebook.com/) with the owning
   Facebook account.
2. Open **Business Settings**. Create a Business Portfolio named for Contrarian
   Club if one does not already exist.
3. Confirm the correct legal or operating name, website, address, and contact
   details. Meta may request business verification later.
4. Open [Meta for Developers](https://developers.facebook.com/apps/).
5. Choose **Create app**. Select the business use case or app type that allows
   business messaging. Meta has renamed this choice before, so use the option
   that creates a business app owned by the Contrarian Club portfolio.
6. Add the **WhatsApp** product to the app.
7. Open **WhatsApp > API Setup** or **Getting Started**.
8. Link or create the WhatsApp Business Account when prompted.

The setup screen should now show:

- a test phone number;
- a temporary access token;
- a WhatsApp Business Account ID, also called the WABA ID;
- a Phone Number ID; and
- a test-recipient selector.

The IDs are not the visible phone number. Copy each value by its label.

## Part 2: Prove the Meta test setup

1. In **WhatsApp > API Setup**, add one mobile number you control as a test
   recipient and complete its verification.
2. Use Meta's built-in **Send message** control with its provided `hello_world`
   template.
3. Confirm that the test message reaches the verified recipient.
4. Record the test WABA ID and Phone Number ID for troubleshooting.

This test uses Meta's temporary number and token. It does not exercise the app
in this repository and does not import the audience list.

## Part 3: Register the dedicated Contrarian Club number

1. In **WhatsApp Manager**, open **Phone numbers** and choose **Add phone
   number**.
2. Enter the Contrarian Club business profile and the intended display name.
   A clear display name is `Contrarian Debate Club` or the registered club name.
3. Enter the dedicated Indian number with country code `+91`.
4. Choose SMS or voice verification and enter the code sent by Meta.
5. Set and securely record the six-digit two-step verification PIN.
6. Complete the business profile with the club website and a support contact.
7. Complete display-name review, business verification, and payment setup when
   Meta requests them.
8. Return to **API Setup** and copy the production Phone Number ID and WABA ID.

Keep the number, two-step PIN, recovery contact, app ownership, and Business
Portfolio access in the club's password manager. Do not leave them under a
single volunteer's personal control.

## Part 4: Create the approved marketing template

1. Open **WhatsApp Manager > Message templates**.
2. Choose **Create template**.
3. Set category to **MARKETING**.
4. Set template name to `new_debate_announcement`.
5. Set language to English. The code configured by this app is normally `en`.
6. Enter this body exactly:

```text
Hi {{1}}, bookings are open for the next Contrarian Club debate.

{{2}}

{{3}} at {{4}}
{{5}}

Book your seat: {{6}}

Reply STOP to stop receiving debate announcements.
```

Use representative samples during submission:

| Variable | Meaning | Sample |
| --- | --- | --- |
| `{{1}}` | Subscriber name | Asha |
| `{{2}}` | Debate title | Should AI replace software engineers? |
| `{{3}}` | Date | Thursday, August 27 |
| `{{4}}` | Time | 7:00 PM |
| `{{5}}` | Venue | Bangalore International Centre |
| `{{6}}` | HTTPS ticket URL | https://thecontrarian.club/tickets |

7. Submit the template and wait for approval.
8. Do not create a campaign until the template shows **Approved**.

The application intentionally fixes the name, category, language, copy, and
variable order. An admin supplies only the five debate values.

## Part 5: Create a production system-user token

The token shown on the Getting Started screen is temporary. Do not use it for
production.

1. Open the Contrarian Club portfolio's **Business Settings**.
2. Open **Users > System users**.
3. Add a system user for the WhatsApp sender. Use an admin system-user role only
   if Meta requires it for asset assignment.
4. Assign the Meta app and the WhatsApp Business Account to this system user
   with the permissions needed to manage and send WhatsApp messages.
5. Generate a token for the app with:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
6. Store the generated token immediately in the deployment secret
   `WHATSAPP_ACCESS_TOKEN`.
7. Never paste the token into a browser-side variable, spreadsheet, issue,
   screenshot, or chat.

Copy the app secret from **App settings > Basic** into
`WHATSAPP_APP_SECRET`. Treat it like a password.

## Part 6: Apply Supabase migrations

Run these after the existing migration 015:

```text
supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql
supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql
```

The migrations create the private master subscriber list, import ledger,
campaign snapshots, delivery records, and transactional queue functions. They
enable row-level security and create no browser-access policies.

## Part 7: Add server-only environment variables

Set these in `.env.local` for local development and in the production
deployment environment:

```text
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_GRAPH_API_VERSION=
WHATSAPP_TEMPLATE_NAME=new_debate_announcement
WHATSAPP_TEMPLATE_LANGUAGE=en
```

Use the current Graph API version shown in Meta's documentation or app
dashboard. Enter it in version form, such as `v25.0`. Do not blindly copy the
example if Meta shows a newer supported version.

Create `WHATSAPP_WEBHOOK_VERIFY_TOKEN` as a long random value. It is a secret
chosen by you, not a value supplied by Meta. Do not prefix any of these names
with `NEXT_PUBLIC_`.

## Part 8: Configure the webhook

The app must already be deployed at a public HTTPS origin for Meta to verify it.

1. In the Meta developer app, open **WhatsApp > Configuration**.
2. Under **Webhook**, choose **Edit** or **Configure**.
3. Set the callback URL to:

```text
https://YOUR-PRODUCTION-HOST/api/whatsapp/webhook
```

4. Enter the exact value stored as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
5. Complete verification. Meta calls the route's GET handler and expects the
   challenge value back.
6. Subscribe the WhatsApp Business Account to the **messages** field.
7. Confirm that signed POST events reach the route.

The POST route verifies `X-Hub-Signature-256` against the raw request body with
`WHATSAPP_APP_SECRET` before parsing JSON. It records sent, delivered, read, and
failed states. Incoming STOP, UNSUBSCRIBE, and REMOVE ME messages immediately
deactivate matching subscribers.

## Part 9: Import the first list

1. Sign in to the admin application.
2. Open **WhatsApp marketing > Import Excel**.
3. Select the latest `.xlsx` guest list. The maximum file size is 4 MB.
4. Preview the import.
5. If headings are ambiguous, select the Name, Phone, Consent, and optional
   preference-time columns.
6. If the workbook has no time column, enter the debate date.
7. Review Added, Updated, Deactivated, Unchanged, and Invalid counts.
8. Confirm the import.

The historical heading `Would you like to stay updated with future debates?`
is recognized. Newer headings that explicitly mention WhatsApp are also
recognized. All numbers are treated as Indian and normalized to `+91` E.164.
The same number is stored once. A later No deactivates it, while an older import
cannot undo a newer STOP or admin decision.

The application treats a Yes value as the club's recorded opt-in because the
club has confirmed that attendees gave verbal permission to receive these
updates. The club remains responsible for ensuring its collection process and
records satisfy applicable policy and law. Do not import people who did not
agree to future contact.

## Part 10: Run a controlled first app test

Do not start with the full list.

1. Use a non-production database or keep only one controlled recipient active.
2. Confirm that `new_debate_announcement` is approved and all production
   environment variables are present.
3. Open **WhatsApp marketing > New campaign**.
4. Enter a real HTTPS ticket URL and test event details.
5. Confirm the displayed recipient count is exactly one.
6. Review the fixed message preview.
7. Check the Meta-charges acknowledgement and create the campaign.
8. Confirm that the campaign page records Meta acceptance and later delivery or
   read status.
9. Reply `STOP` from the controlled phone and confirm the subscriber becomes
   inactive.
10. Reactivate the wider list only after this complete flow works.

Creating a campaign can incur Meta charges. No test or setup command in this
repository sends a production message automatically.

## Normal operating procedure

After each debate:

1. Export the guest list to `.xlsx`.
2. Import and preview it at `/admin/whatsapp/import`.
3. Correct invalid rows or confirm the valid portion.

When the next debate opens:

1. Open `/admin/whatsapp/campaigns/new`.
2. Confirm the active-recipient count.
3. Enter title, date, time, venue, and HTTPS ticket link.
4. Review the message and acknowledge possible charges.
5. Create the campaign and leave the page open while batches run.
6. Review failed and unknown outcomes. Retry an unknown outcome only after
   accepting the duplicate-message risk.

## Policy and current references

- [Meta WhatsApp Cloud API getting started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Meta WhatsApp Cloud API webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks)
- [Meta's official WhatsApp Postman workspace](https://www.postman.com/meta/whatsapp-business-platform/overview)
- [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/)
- [WhatsApp Business Platform developer hub](https://whatsappbusiness.com/developers/developer-hub/)

Meta policy requires the recipient's number and opt-in permission for subsequent
messages, requires an approved template for business-initiated conversations,
and requires opt-out requests to be honored. Review the live policy and current
pricing before each production rollout.

## Troubleshooting

### Template rejected or not found

Confirm the template is approved, its name is exactly
`new_debate_announcement`, the configured language matches the approved
language, and the Phone Number ID belongs to the same WABA.

### Webhook verification fails

Confirm the deployment is public HTTPS, the callback ends in
`/api/whatsapp/webhook`, and Meta's verify token exactly matches
`WHATSAPP_WEBHOOK_VERIFY_TOKEN` in that deployment.

### Messages remain queued

Open the campaign page and choose **Resume sending**. Confirm all eight Meta
environment variables are present. Check the campaign's safe error text without
copying tokens or full phone numbers into logs or support messages.

### An outcome is unknown

Do not retry automatically. Meta may have accepted the message before the app
lost the response. Check the recipient or Meta tooling first, then use the
explicit duplicate-risk control if a retry is still appropriate.
