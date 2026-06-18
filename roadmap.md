# Contrarian Club Live Roadmap

## Product Goal

Build a Mentimeter-style live audience interaction app tailored for debate events. Attendees join by scanning a QR code or entering a short event code, participate from their phones, and see a polished presentation view controlled by the host.

The first version should prioritize reliability during live events over breadth. Every critical live feature needs a fallback state that still works if realtime updates lag or a client refreshes mid-event.

## Core Roles

- **Host:** Creates and controls the event, launches questions, toggles result visibility, advances presentation screens, and exports results.
- **Moderator:** Reviews submitted audience questions, approves or rejects them, pins questions for the presenter view, and manages the question queue.
- **Audience member:** Joins without an account, answers polls, submits questions, and sees results only when the host allows it.
- **Presenter display:** A public projector view that shows the current slide, QR code, active poll, results, Q&A, timers, and transitions.

## MVP Features

### Event Setup

- Create an event with title, date, venue, and optional branding.
- Generate a short event code.
- Generate a QR code for audience join.
- Configure event-level settings:
  - anonymous participation on/off
  - one response per participant/device
  - results visible to audience by default on/off
  - presenter display theme

### Audience Join Flow

- Join by QR code or event code.
- Optional display name.
- Lightweight participant session stored on device.
- Mobile-first interface.
- Clear states for waiting, active question, submitted response, and results.

### Polls And Questions

- Create multiple-choice polls.
- Support single-select and multi-select questions.
- Open and close voting from the host dashboard.
- Prevent duplicate voting per participant.
- Show response counts and percentages.
- Allow host to decide per poll:
  - hide results from audience
  - show results after vote submission
  - show results only when host reveals them
  - show results only on presenter display

### Presentation View

- Dedicated projector route for the live event.
- Large QR code and event code join screen.
- Active question display.
- Menti-like animated result reveal.
- Bar chart result view.
- Audience count and response count.
- Waiting screen between activities.
- Host-controlled progression between presentation states.

### Moderated Q&A

- Audience can submit questions.
- Moderator queue for pending questions.
- Approve, reject, archive, and pin questions.
- Presenter display shows pinned or approved questions.
- Optional audience visibility for approved questions.

### Debate-Specific MVP

- Motion display.
- Pre-debate vote.
- Post-debate vote.
- Opinion swing result comparing before vs after.
- Speaker timer shown on presenter display.
- Export event summary with pre/post vote results and approved questions.

## Menti-Like Features To Recreate

### Interaction Types

- Multiple choice.
- Word cloud.
- Ranking.
- Open text.
- Rating scale.
- Quiz mode with correct answer.
- Opinion scale.
- 2x2 matrix or quadrant vote.

### Presentation Styling

- Fullscreen presentation mode.
- Smooth transitions between screens.
- Large readable typography for projector use.
- Theme presets.
- Custom colors and event branding.
- Optional logo placement.
- Animated result charts.
- QR code persistent or temporary overlay.
- Join instructions visible on each interactive slide.

### Result Visibility Controls

- Host can hide or reveal results at any point.
- Audience can be blocked from seeing aggregate results.
- Presenter display can show results while audience devices stay hidden.
- Results can be revealed automatically after poll closes.
- Results can be revealed manually by host.
- Individual responses are never shown unless the interaction type requires it.

### Host Controls

- Start activity.
- Pause activity.
- Close submissions.
- Reveal results.
- Hide results.
- Advance to next activity.
- Reset activity during rehearsal.
- Duplicate activity.
- Reorder activities.

## Reliability Requirements

- Realtime updates should use Supabase Realtime.
- Presenter display should also poll periodically as a fallback.
- Host dashboard should show connection status.
- Audience submission should write directly to Postgres, not depend only on realtime.
- Voting should be idempotent where possible.
- Database constraints should prevent duplicate votes.
- Critical screens should recover correctly after browser refresh.
- Host should have a manual refresh/re-sync button.
- Event should support a read-only fallback results view.

## Suggested Tech Stack

- Next.js App Router.
- TypeScript.
- Supabase Postgres.
- Supabase Realtime.
- Supabase Auth for hosts and moderators.
- Anonymous participant sessions for audience members.
- Tailwind CSS.
- shadcn/ui or a small custom component system.
- Recharts or Visx for charts.
- QR code generation library.
- Vercel hosting.

## Data Model Draft

- `events`
- `event_hosts`
- `participants`
- `activities`
- `poll_options`
- `votes`
- `questions`
- `presentation_state`
- `speaker_timers`
- `event_exports`

## Build Phases

### Phase 1: End-To-End Live Poll Slice

Goal: get the smallest complete version working in production-like conditions from the start. This phase should prove the full live loop before adding more activity types or debate-specific features.

- Initialize the Next.js app with TypeScript.
- Connect Supabase from the start:
  - Supabase project configuration.
  - Supabase client setup.
  - initial database schema.
  - local environment variables.
  - deployed environment variables.
- Set up hosting from the start:
  - Vercel project.
  - production deployment.
  - preview deployments.
  - basic deployment checklist.
- Create one event.
- Generate one short event code.
- Generate a QR code for audience join.
- Build audience join route: `/join/[code]`.
- Store an anonymous participant id on the audience device.
- Build one multiple-choice poll.
- Build host controls:
  - open poll
  - close poll
  - reveal results
  - hide results
- Allow audience members to submit one vote.
- Write votes directly to Supabase Postgres.
- Prevent duplicate votes with a database constraint.
- Build presenter route: `/present/[code]`.
- Presenter view shows:
  - event code
  - QR code
  - active question
  - response count
  - results only when the host reveals them
- Use Supabase Realtime for presenter updates.
- Add simple polling fallback for the presenter view.

The successful Phase 1 flow is:

```text
host creates event
  -> audience joins by QR/code
  -> host opens poll
  -> audience votes
  -> presenter updates
  -> host reveals or hides results
```

### Phase 2: Event Safety

- Add broader database constraints and indexes for event integrity.
- Harden the presenter polling fallback.
- Add host connection status.
- Add recovery after page refresh.
- Add rehearsal/reset mode.
- Add basic export.

### Phase 3: Debate Workflow

- Add motion setup.
- Add pre/post debate vote flow.
- Add opinion swing visualization.
- Add speaker timer.
- Add moderated Q&A.
- Add pinned questions on presenter display.

### Phase 4: Menti-Style Polish

- Add animated chart reveals.
- Add theme presets.
- Add word cloud.
- Add ranking and scales.
- Add activity ordering.
- Add reusable presentation templates.

### Phase 5: Production Readiness

- Add row-level security policies.
- Add rate limits for submissions.
- Add event archive.
- Add admin audit trail.
- Add venue Wi-Fi/mobile testing checklist.
- Add load test script for simulated participants.

## Pre-Event Operating Checklist

- Freeze feature changes 48 to 72 hours before event day.
- Run a full rehearsal using the actual event flow.
- Test on projector dimensions.
- Test on venue Wi-Fi and mobile data.
- Print or save backup QR/event code.
- Prepare fallback Google Form for voting.
- Prepare fallback slide with manual result entry.
- Confirm host and moderator devices are charged and logged in.
- Export a backup of event setup before doors open.
