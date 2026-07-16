# Week 2 — Event and competition configuration

## Goal and safe fixtures

Coordinator configures an event from draft to a runnable competition: information, tracks, criteria, rounds, advancement rules, judge/mentor assignments, prizes and announcements. Use `coordinator@seal.test`; use `coordinator2@seal.test` only for V18 disposable events.

Read-only anchors: `SEAL Summer 2026`, `SEAL Spring 2025`, `SEAL Fall 2024 Archive`. Mutation anchors: `SEAL Fall 2026`, `SEAL Fall 2027 (Delete Me)`, `SEAL Spring 2027 (Cancel Me)`, `Throwaway Track`, `Deprecated Sample Criterion`.

## W2-S01 — Public discovery and event detail

1. Logout and open `/events`; filter/browse public events.
2. Open `SEAL Summer 2026`; verify description, lifecycle status, registration/competition dates, tracks, rounds and awards links.
3. Open `/explore`; confirm it resolves to the event list.
4. Open `SEAL Spring 2025`; verify completed/published historical information.
5. Open `SEAL Fall 2024 Archive`; confirm the `ARCHIVED` state can be queried but cannot be mutated by Guest.

Failure: call public detail with an unknown UUID (404), invalid season/status filter (400), and a coordinator mutation endpoint without token (401).

## W2-S02 — Create a draft event through the wizard

1. Login as coordinator; sidebar → **Events** → create-event action (`/coordinator/events/create`).
2. In Event Details enter a unique **Event name**, season/year, registration window, competition window, status `DRAFT`, and description.
3. Add at least two tracks. For each set **Track name**, required link types, min members 3, max members 5, maximum teams and description.
4. Select default scoring criteria and add a custom event-only criterion if needed; ensure active weights form the intended total.
5. Add rounds with unique order, **Round name**, start/end, submission deadline and judging deadline. Mark only the last round final.
6. Assign mentors by track and judges by round/track; optionally create a guest judge.
7. Add prizes with unique scope/rank.
8. Review and submit. Expect event detail/edit page and all children persisted.

**Failure checks before success**

- Duplicate season/year or slug: 409.
- Registration close before open; competition end before start: 400.
- Track min > max, zero/negative limits, or duplicate track name/order: 400/409.
- Round start outside event, deadline after round end, judging before submission, duplicate order: 400/409.
- Duplicate prize rank in the same event/track scope: 409.

## W2-S03 — Edit event information and lifecycle

1. **Events** → open `SEAL Spring 2027 (Cancel Me)` → edit.
2. In the Info tab change a harmless description/date that remains valid, save, refresh and confirm.
3. Advance lifecycle only through permitted transitions. Capture previous/new status and relevant timestamp.
4. At the end, use the cancel action and confirm status `CANCELLED`.

**Failure checks**

- Skip an unsupported lifecycle transition or move a terminal event backward: 409.
- Change season/year to a pair already used: 409.
- Student/Judge mutation: 403.
- Cancel twice: 409.

## W2-S04 — Track CRUD and capacity rules

1. Open edit for `SEAL Fall 2026` → Tracks tab.
2. Create a fresh track with min 3/max 5 and required `REPOSITORY` + `DEMO`; verify list/detail.
3. Edit **Throwaway Track**, change name/description/capacity, save and refresh.
4. Assign/remove a mentor on a track with the disposable `mentor3` assignment.
5. Delete only **Throwaway Track** at the end; confirm it disappears.

Failures: event/track mismatch, invalid min/max, delete a track containing teams/assignments, duplicate mentor assignment, assign non-mentor user, unauthorized role.

## W2-S05 — Scoring criteria templates

1. Coordinator/Admin sidebar → **Criteria**.
2. Create a disposable template: name, category, max score, default weight, technical/default/active flags, rubric and description.
3. Edit it and save; deactivate then activate and observe filters.
4. For V18 `Deprecated Sample Criterion`, exercise activate → deactivate → delete, in that order and only after evidence.

Failures: blank/duplicate name, max score ≤ 0, negative weight, invalid category, deleting a template referenced by event criteria, wrong role.

## W2-S06 — Event criteria and round-scoped criteria

1. **Events** → `SEAL Fall 2026` → edit → criteria, or route `/coordinator/events/{eventId}/criteria`.
2. Add a template-backed criterion; override description/rubric/weight/max score if needed.
3. Add one **Create custom event-only criteria** row.
4. Scope a criterion to selected rounds and verify `/coordinator/rounds/{roundId}/criteria` shows only applicable active criteria.
5. Edit then delete only V18 `Draft Custom Criterion`.

Failures: criterion from another event, non-existent round ID, duplicate template use, invalid override values, total effective weights invalid for business rule, wrong role.

## W2-S07 — Round CRUD, windows and state transitions

1. Edit `SEAL Fall 2026` → Rounds tab.
2. Create a disposable upcoming round with valid start/end/submission/judging order.
3. Edit its name/instructions/dates while status allows.
4. Inspect V18 `Expired Open Round`: it is `OPEN` with submission deadline in the past and is reserved for deadline-transition/close testing.
5. Inspect V19 archived rounds to verify filters for `PENDING_LOCK` and `CLOSED`.
6. Trigger the supported close/lock transition on the disposable expired round, refresh and capture status/timestamps.
7. Delete only an unused upcoming disposable round.

Failures: open before competition, close twice, delete a round with submissions/scores, deadline ordering violation, edit locked terminal round, event mismatch, wrong role.

## W2-S08 — Advance-rule configuration and preview

1. Open a round → advancement/advance-rules page.
2. Create rules covering `TOP_N`, `TOP_PERCENT`, `MIN_SCORE` and `WILDCARD` as supported; set scope, value, priority and description.
3. Update V18 disposable `WILDCARD` rule and run preview/suggestions without confirming.
4. Delete only the disposable rule; retain the real `TOP_N` final rule.

Failures: negative/zero impossible values, percentage > 100, duplicate priority/scope where rejected, track outside round event, preview without rankings, edit after advancement confirmation.

## W2-S09 — Assign mentors and judges

1. From event creation/edit assignment section, select an active mentor and a track; save and verify mentor dashboard scope.
2. Select active judge, round and optional track; save and verify judge dashboard queue.
3. Use `judge5` mobile final assignment as the remove/unassign target after queue evidence.
4. Use `mentor3` Spring backend assignment as the remove target after mentor evidence.

Failures: duplicate assignment, expired `judge4`, user with wrong role, round/track from different events, removing assignment that owns locked scores, wrong actor.

## W2-S10 — Prize configuration

1. Navigate through **Awards** to a selected event, then prize setup.
2. Create a unique overall or track prize; fill rank, title, value, currency, sponsor and description.
3. Update and inspect V18 `Consolation Prize (Disposable)`.
4. Delete that disposable rank-4 prize only after Week 5 award-negative evidence if the Week 5 run needs it.

Failures: duplicate event/track/rank, negative value, track from another event, delete already-awarded prize, unauthorized actor.

## W2-S11 — Announcement lifecycle

1. Sidebar → **Announcement**; select `SEAL Summer 2026`.
2. Create a draft with event, title, content, target scope/roles/tracks and delivery switches.
3. Edit draft, schedule for a future time, then inspect scheduled state.
4. Use another disposable draft for **Send now**/publish.
5. Pin, unpin, mark as result announcement and unpublish only where state permits.
6. Delete/cancel only the dedicated draft/scheduled fixture.

Failures: blank title/content, past schedule, target ID from another event, publish twice, edit/delete published row where forbidden, student/judge mutation.

## W2-S12 — Delete event safely

1. Login as `coordinator2@seal.test`.
2. Open **Events** → `SEAL Fall 2027 (Delete Me)`.
3. Verify it is `DRAFT` and has no dependent teams/submissions.
4. Use delete, confirm once, refresh the list and confirm 404 by ID.

Failure: attempt to delete Summer 2026 or any event with dependent business data; expect conflict and no cascade loss.

## Week 2 completion checkpoint

- Event and child validation boundaries captured.
- Every lifecycle state, including V19 `ARCHIVED`, `PENDING_LOCK`, `CLOSED`, is queryable.
- Mutations use only disposable rows.
- Assignment, prize and announcement state failures captured.
- Event delete/cancel tests did not damage Summer 2026 or Spring 2025.
