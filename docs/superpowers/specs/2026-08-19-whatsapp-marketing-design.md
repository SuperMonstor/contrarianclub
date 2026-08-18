# WhatsApp Marketing Design

## Context

Contrarian Club collects guest information in an Excel workbook after each
debate. The workbooks contain a name, an Indian mobile number, and a Yes or No
answer to a notification question. The heading for that question has changed
over time. The club has confirmed that guests marked Yes also gave verbal
confirmation that they wanted to be contacted through WhatsApp.

The club needs one common, deduplicated subscriber list. After each debate, an
admin imports the latest workbook. When bookings open for another debate, an
admin sends the same approved announcement template to every active subscriber.

This is a marketing subsystem inside the existing application, not an extension
of the live debate workflow.

## Goals

- Provide a protected `/admin/whatsapp` section using the existing admin login.
- Import `.xlsx` guest lists whose relevant headings may vary.
- Normalize Indian mobile numbers and keep one subscriber per number.
- Apply the newest Yes or No preference from later imports.
- Send one Meta-approved marketing template to every active subscriber.
- Resume partial campaigns without sending successful deliveries twice.
- Record sent, delivered, read, and failed statuses from Meta webhooks.
- Deactivate subscribers who opt out through WhatsApp or the admin interface.
- Provide a current, step-by-step Meta Business and WhatsApp Cloud API setup
  guide.

## Non-goals

- Connecting campaigns to debate creation, publishing, voting, or event status.
- Segmenting recipients by debate, source workbook, or attendee attributes.
- Scheduling reminders or sending automatically.
- Supporting non-Indian phone numbers.
- Supporting arbitrary outbound message text outside an approved template.
- Retaining uploaded workbook files after an import is confirmed.
- Calculating Meta messaging charges in the application.
- Adding Twilio or another WhatsApp provider.

## User workflow

### Update the subscriber list

1. An authenticated admin opens `/admin/whatsapp/subscribers`.
2. The admin uploads one `.xlsx` workbook.
3. The importer detects the name, phone, opt-in, and optional preference-time
   columns.
4. If the workbook has no preference-time column, the admin supplies the debate
   date represented by the workbook.
5. The preview shows the selected columns and counts for additions, updates,
   deactivations, unchanged rows, and invalid rows.
6. If a heading is unfamiliar or ambiguous, the admin selects the correct
   column from a dropdown. The importer never guesses silently.
7. The admin confirms the import.
8. The system applies the import atomically and records a summary. The workbook
   itself is discarded.

### Send an announcement

1. An authenticated admin opens `/admin/whatsapp/campaigns/new`.
2. The admin enters the debate title, date, time, venue, and ticket URL.
3. The page renders a preview of the approved template and shows the current
   active subscriber count.
4. The admin confirms that Meta messaging charges may apply and presses Send.
5. The system creates one delivery for every subscriber who is active at that
   moment.
6. The browser requests small send batches until no queued deliveries remain.
7. If the browser closes, the campaign remains resumable from its detail page.
8. The detail page shows queued, sent, delivered, read, and failed counts. A
   retry action targets only retryable failed deliveries.

## Architecture

The feature lives in the existing Next.js application and uses the existing
Supabase project and admin authentication. Marketing code, routes, and tables
use a `whatsapp_` prefix and do not reference the existing `events` table.

```text
Excel workbook
  -> protected import route
  -> preview and confirmation
  -> whatsapp_subscribers

Admin campaign form
  -> campaign and delivery snapshot
  -> protected batch sender
  -> Meta WhatsApp Cloud API
  -> WhatsApp recipients

Meta WhatsApp Cloud API
  -> signed public webhook
  -> delivery status updates and opt-outs
```

The application calls the Graph API directly with `fetch`. It does not require
a Meta SDK. All Graph API calls use an explicitly configured API version so a
future version upgrade is deliberate and testable.

## Data model

### `whatsapp_subscribers`

One row represents one Indian mobile number.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `phone_e164` | `text` | Unique normalized number such as `+919876543210` |
| `name` | `text null` | Latest non-empty imported name |
| `is_active` | `boolean` | Whether future campaigns include the subscriber |
| `preference_at` | `timestamptz` | Time of the newest applied Yes, No, STOP, or admin action |
| `preference_source` | `text` | `import`, `whatsapp`, or `admin` |
| `source_import_id` | `uuid null` | Import that supplied the current preference |
| `opted_out_at` | `timestamptz null` | Latest deactivation time |
| `created_at` | `timestamptz` | Creation time |
| `updated_at` | `timestamptz` | Last update time |

`phone_e164` has a unique constraint. Public and anonymous database roles have
no access to this table.

### `whatsapp_imports`

One row records one confirmed workbook import.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `file_name` | `text` | Original file name, without file contents |
| `file_sha256` | `text` | Prevents accidental duplicate imports |
| `name_column` | `text` | Confirmed name heading |
| `phone_column` | `text` | Confirmed phone heading |
| `consent_column` | `text` | Confirmed Yes or No heading |
| `preference_time_column` | `text null` | Confirmed time heading when present |
| `source_date` | `date null` | Admin-supplied debate date when rows have no preference time |
| `added_count` | `integer` | New active subscribers |
| `updated_count` | `integer` | Existing subscribers whose current data changed |
| `deactivated_count` | `integer` | Existing subscribers changed to inactive |
| `unchanged_count` | `integer` | Valid rows that made no change |
| `invalid_count` | `integer` | Rows excluded from the import |
| `imported_by` | `uuid` | Supabase Auth user ID |
| `created_at` | `timestamptz` | Confirmation time |

The raw workbook and raw rows are not persisted.

### `whatsapp_campaigns`

One row represents one announcement.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `template_name` | `text` | Approved Meta template name |
| `language_code` | `text` | Approved template language |
| `parameters` | `jsonb` | Debate title, date, time, venue, and ticket URL |
| `status` | `text` | `draft`, `sending`, `completed`, `partial_failed`, or `cancelled` |
| `recipient_count` | `integer` | Number of active subscribers at confirmation |
| `created_by` | `uuid` | Supabase Auth user ID |
| `started_at` | `timestamptz null` | First send time |
| `completed_at` | `timestamptz null` | Terminal time |
| `created_at` | `timestamptz` | Creation time |

### `whatsapp_deliveries`

One row represents one subscriber in one campaign. These rows are delivery
records, not audience segments.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `campaign_id` | `uuid` | Parent campaign |
| `subscriber_id` | `uuid` | Subscriber selected at confirmation |
| `recipient_phone` | `text` | Phone snapshot used for this send |
| `recipient_name` | `text null` | Name snapshot used for the greeting |
| `status` | `text` | `queued`, `sending`, `sent`, `delivered`, `read`, `retryable_failed`, `unknown`, or `failed` |
| `whatsapp_message_id` | `text null` | Meta `wamid` returned by the send request |
| `attempt_count` | `integer` | Number of API attempts |
| `claimed_at` | `timestamptz null` | Time the sender claimed the delivery |
| `last_error_code` | `text null` | Latest Meta or transport error code |
| `last_error_message` | `text null` | Safe diagnostic message without secrets |
| `sent_at` | `timestamptz null` | Meta acceptance time |
| `delivered_at` | `timestamptz null` | Delivery webhook time |
| `read_at` | `timestamptz null` | Read webhook time |
| `failed_at` | `timestamptz null` | Terminal failure time |
| `created_at` | `timestamptz` | Snapshot time |
| `updated_at` | `timestamptz` | Latest status time |

The pair `(campaign_id, subscriber_id)` is unique. A non-null
`whatsapp_message_id` is also unique.

## Workbook import rules

The first release accepts `.xlsx` files up to 4 MB. Formula execution, macros,
`.xls`, CSV, and password-protected workbooks are not supported.

The importer reads the first non-empty worksheet and requires:

- a name column;
- a phone column;
- a consent column containing Yes or No values; and
- an optional purchase or preference time column.

Known headings are matched case-insensitively after trimming whitespace and
punctuation. The consent matcher recognizes headings that refer to staying
updated, future debates, notifications, or WhatsApp. Every match remains visible
in the preview. Zero or multiple matches require the admin to select a column.

Phone normalization removes whitespace and punctuation, then accepts:

- ten digits beginning with 6, 7, 8, or 9;
- eleven digits with a leading `0`; or
- twelve digits with a leading `91`.

All accepted values become `+91` followed by the ten-digit mobile number.

Consent values are trimmed and compared case-insensitively. `Yes` activates or
adds a subscriber. `No` deactivates an existing subscriber and does not create a
new inactive subscriber. Blank or unfamiliar values are invalid and do not
change the database.

The preference time is the workbook's purchase or response time when available.
If the workbook has no such column, the admin must supply the debate date and
the importer uses the end of that date in the configured club time zone. A
preference applies only when it is newer than the stored `preference_at`. An
import cannot reactivate a subscriber when its preference time is older than or
equal to a later WhatsApp or admin opt-out. An admin may reactivate that
subscriber after confirming a new opt-in.

Rows are deduplicated by normalized phone number before preview. When one
workbook contains multiple rows for a number, the newest timestamp wins. If the
rows have no timestamps and disagree, the row is invalid until corrected.

The browser retains the selected workbook only until confirmation. Confirmation
uploads the file again with the selected mapping and optional source date. The
server reparses it, verifies its hash, and recomputes every change instead of
trusting preview data from the browser. Import confirmation then runs in one
database transaction. The file hash prevents an exact workbook from being
confirmed twice.

## Message template

The first release uses one approved MARKETING template named
`new_debate_announcement`. The exact language code submitted to Meta is stored
in configuration and copied to each campaign.

```text
Hi {{1}}, bookings are open for the next Contrarian Club debate.

{{2}}

{{3}} at {{4}}
{{5}}

Book your seat: {{6}}

Reply STOP to stop receiving debate announcements.
```

Parameters are, in order:

1. subscriber name, or `there` when the name is missing;
2. debate title;
3. date;
4. time;
5. venue; and
6. absolute HTTPS ticket URL.

The application validates that every value is non-empty, that the ticket URL
uses HTTPS, and that parameter lengths fit the approved template before it
creates a campaign.

## Campaign processing

Confirming a campaign creates the campaign and all delivery rows in one
transaction. The audience is every subscriber with `is_active = true` at that
moment. Later imports affect later campaigns, not an already confirmed
campaign.

The protected batch endpoint claims up to 20 queued or retryable deliveries.
It sends no more than five requests concurrently. A delivery is marked
`sending` before the Graph API call and `sent` only after Meta returns a
`whatsapp_message_id`.

HTTP 429 responses and Meta 5xx responses are retryable. Other Meta 4xx
responses are terminal unless Meta's documented error semantics say otherwise.
Retryable deliveries stop automatically after three attempts and become failed.
The campaign page can resume queued work and retry eligible failures. It never
selects sent, delivered, or read deliveries for another send.

A connection loss can make the outcome indeterminate because Meta may accept a
message before the application receives its `whatsapp_message_id`. Such a
delivery becomes `unknown`, not retryable. A `sending` delivery whose worker
does not finish within five minutes also becomes `unknown`. The campaign page
shows these separately and requires an admin to acknowledge the duplicate-send
risk before retrying one.

The campaign becomes `completed` when every delivery is sent or has a later
delivery status. It becomes `partial_failed` when no queued work remains and at
least one delivery is failed or unknown.

## Webhook behavior

The public webhook route supports Meta's GET verification handshake and POST
notifications. GET verification requires the configured verification token.
POST requests require a valid `X-Hub-Signature-256` HMAC computed with the Meta
app secret before their JSON body is processed.

Status notifications locate a delivery by `whatsapp_message_id`. Updates are
monotonic: `sent` cannot replace `delivered`, and neither can replace `read`.
Duplicate webhook deliveries are harmless.

Incoming text is trimmed, collapsed to single spaces, and compared
case-insensitively. `STOP`, `UNSUBSCRIBE`, and `REMOVE ME` immediately set the
subscriber inactive with `preference_source = 'whatsapp'`. The same operation
is safe to repeat. Other incoming messages are ignored in the first release.

## Admin interface

### Overview

`/admin/whatsapp` shows active subscribers, inactive subscribers, the latest
import summary, and recent campaigns. It links to Subscribers, Import, New
campaign, and campaign detail pages.

### Subscribers

The subscriber list is searchable by name or phone. Admins can deactivate a
subscriber immediately. Reactivation requires a confirmation that the person
has opted in again and records an admin preference timestamp.

### Import preview

The preview never displays more personal data than necessary. It shows the
confirmed column mapping, aggregate change counts, and only invalid or
conflicting rows that require correction. Phone numbers in aggregate views are
masked except for their last four digits.

### Campaign detail

The page shows the template preview, recipient count, progress counts, safe
error summaries, and controls to resume or retry. Unknown outcomes are visually
separate from failed sends, and retrying one requires a duplicate-risk
confirmation. There is no event picker and no link to the live debate admin
workflow.

## Security and privacy

- Every admin page, Server Action, and protected route verifies the existing
  Supabase admin session inside the operation.
- Marketing tables have no public read or write policies. Privileged access is
  server-only.
- The Meta access token, app secret, and webhook verification token never use a
  `NEXT_PUBLIC_` prefix and never enter Client Component props or logs.
- The webhook validates the raw request body before parsing it.
- Uploaded workbooks are size-limited, parsed server-side, and discarded after
  preview or confirmation.
- Logs contain campaign and delivery IDs, not full phone numbers, access tokens,
  or webhook bodies.
- The UI and documentation link to a published privacy policy and identify a
  contact for privacy or opt-out questions.

Required server-only deployment variables are:

```text
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_APP_SECRET
WHATSAPP_WEBHOOK_VERIFY_TOKEN
WHATSAPP_GRAPH_API_VERSION
WHATSAPP_TEMPLATE_NAME
WHATSAPP_TEMPLATE_LANGUAGE
```

## Meta setup runbook

Implementation includes `docs/whatsapp-setup.md` with current screenshots or
label descriptions where Meta's interface varies. It covers:

1. Enable two-factor authentication on the owning Meta account.
2. Create or select the Contrarian Club Business Portfolio.
3. Create a Business app in Meta for Developers and add WhatsApp.
4. Use the test phone number, temporary token, and `hello_world` template to
   send one test message to a verified recipient.
5. Record the test WABA ID and phone-number ID.
6. Add a dedicated Indian number that can receive the verification code.
7. Verify number ownership and set the six-digit two-step verification PIN.
8. Complete the WhatsApp business profile, display-name review, payment setup,
   and any business verification Meta requests.
9. Submit `new_debate_announcement` as a MARKETING template with representative
   sample values.
10. Create a Meta system user, assign the app and WABA assets, and generate a
    production token with `whatsapp_business_messaging` and
    `whatsapp_business_management`.
11. Configure the production webhook URL and verification token, subscribe to
    the `messages` field, and verify signed delivery and inbound-message events.
12. Store production values as server-only deployment secrets.

The runbook links to Meta's current Cloud API documentation and WhatsApp
Business Messaging Policy. It notes that Meta screens, Graph API versions,
pricing, and review requirements can change and must be checked during setup.

No implementation or test command sends a production WhatsApp message. A real
test or campaign requires the user's explicit confirmation because Meta charges
may apply.

## Error handling

- An unreadable or unsupported workbook fails before any database change.
- Ambiguous headings block confirmation and explain which mapping is missing.
- Invalid rows remain excluded and visible in the preview count.
- A failed import transaction changes no subscribers and creates no import row.
- Missing Meta configuration disables sending and lists the missing variable
  names without exposing values.
- A partial campaign remains resumable and reports successful and failed counts
  separately.
- A lost API response becomes unknown and is never retried automatically.
- Invalid webhook signatures receive a rejection and make no database changes.
- Unknown Meta message IDs are acknowledged and logged by safe identifier so
  Meta does not retry an event that cannot be applied.

## Testing

Unit tests cover:

- heading normalization and ambiguous mappings;
- Indian phone normalization and invalid numbers;
- Yes and No parsing;
- in-file deduplication and conflicting rows;
- preference ordering, including an old import after STOP;
- template parameter validation and Graph API payloads;
- opt-out command parsing;
- webhook signature verification; and
- monotonic delivery status updates.

Database tests cover unique subscriber phones, unique campaign deliveries,
transactional import application, campaign snapshots, and protected access.

Route tests use a mocked Graph API and signed webhook fixtures. They prove that
successful deliveries are not retried, transient failures can resume, terminal
failures stop, and invalid signatures make no changes.

Manual verification uses this progression:

```text
Meta test number and hello_world
  -> dedicated number and approved template
  -> one imported test subscriber
  -> one app-generated template message
  -> small internal campaign
  -> full subscriber campaign
```

The final production test and every full campaign require an explicit admin
confirmation in the application.

## Rollout

1. Complete the Meta test-number setup and confirm one dashboard-generated test
   message.
2. Apply the database migration and deploy the protected subscriber import.
3. Import the supplied sample workbook and reconcile its preview totals against
   the source workbook.
4. Register the dedicated number and obtain template approval.
5. Configure production secrets and webhook verification.
6. Send one app-generated template message to a controlled recipient.
7. Run a small internal campaign and verify delivery, read, failure, and STOP
   handling.
8. Enable full campaigns after the internal test passes.

## External references

- WhatsApp Cloud API setup:
  https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- WhatsApp Business Messaging Policy:
  https://whatsappbusiness.com/policy/
- Meta WhatsApp Cloud API collection:
  https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api
- Digital Personal Data Protection Act, 2023:
  https://www.indiacode.nic.in/handle/123456789/22037
- Digital Personal Data Protection Rules, 2025:
  https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa
- Vercel Functions limits:
  https://vercel.com/docs/functions/limitations
