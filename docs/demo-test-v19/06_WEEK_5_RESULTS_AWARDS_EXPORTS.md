# Week 5 — Results, advancement, disqualification, awards and exports

## Goal and prerequisites

Turn finalized scores into auditable outcomes: calculate ranking, inspect variance/ties, preview and confirm advancement, handle disqualification/appeal, publish results, award prizes and create/download exports.

Run Week 4 first for live final-round changes. For a stable historical demonstration, use `SEAL Spring 2025`; for controlled progression, use Summer 2026 fixtures. Account: `coordinator@seal.test`; public/student verification: Guest and `student1@seal.test`.

## W5-S01 — Ranking queries before mutation

1. Coordinator opens the selected event ranking route (`/coordinator/events/{eventId}/rankings`).
2. Select **Round** and optional **Track**; inspect team/submission score, judge count, rank, tie and advancement state.
3. Open Spring 2025 historical rankings and verify the engineered 8.30 tie is flagged/resolved as seeded.
4. As Guest open `/standings`, event leaderboard and track leaderboard.
5. Confirm unpublished Summer round data is hidden from Guest/other teams.

Failure: event/round/track mismatch, unknown IDs, private results before publish, malformed filters.

## W5-S02 — Recalculate/preview ranking

1. Ensure chosen round grading is complete/locked as required.
2. Coordinator invokes recalculation for one round/track; capture before/after counts and calculated timestamp.
3. Repeat calculation without changing scores. Results must be deterministic/idempotent and not create duplicate `(submission, round)` rows.
4. Preview calculation where supported before committing.

Failures: unlocked/incomplete grading, zero judges/criteria, disqualified-only set, wrong event/round/track, student/judge actor. Expect controlled conflict, not partial ranking replacement.

## W5-S03 — Tie and score-variance review

1. Open Spring 2025 web ranking; verify tied total scores and tie metadata/manual resolution.
2. Open Summer event variance dashboard (`/coordinator/events/{eventId}/variance-dashboard`).
3. Filter by round/track/judge type and inspect high-variance submissions/judges.
4. Trigger anonymized RBL/score dataset export; verify raw participant names and direct judge IDs are removed/hashed as designed.

Failures: invalid `judgeType` (only `INTERNAL`/`GUEST`), round/track not in event, non-coordinator/admin, export without event ID.

## W5-S04 — Advancement rules preview and confirmation

1. Coordinator opens `/coordinator/rounds/{roundId}/advancement`.
2. Review configured rule priority/scope; run **Preview**/suggestions. Confirm no team state changes yet.
3. Apply a documented override only to a tie/exception fixture and enter **Reason for override**.
4. Click confirm advancement only after reviewing candidates.
5. Verify advanced/eliminated flags, team status, confirmation timestamp, notifications and participant `/teams/{teamId}/rounds/{roundId}/advancement-status`.

The new plan must explicitly execute the three operations omitted by Fable:

- `POST /rounds/{roundId}/advancement-preview`
- `POST /rounds/{roundId}/advancement/suggestions`
- `POST /rounds/{roundId}/advancement/confirm`

Failures: no rankings, unresolved tie without override, confirm twice, change rule after confirm, blank override reason, wrong role.

## W5-S05 — Disqualify a submission/team

1. Coordinator sidebar → **Disqualifications**; choose an event/round/track and dedicated disposable submission.
2. Open disqualify dialog, enter mandatory **Reason** and optional evidence URL; confirm.
3. Verify submission/team active-disqualification query, status effect, audit and participant notification.
4. Verify rankings exclude the disqualified entry after recomputation as required.

Failures: blank reason, invalid evidence URL, already disqualified submission, wrong event scope, unknown submission, student/judge actor.

## W5-S06 — Appeal, uphold and overturn

1. Participant owning the seeded pending-disqualification fixture opens `/participant/teams/{teamId}/disqualification`.
2. Submit one appeal note; verify `PENDING` and coordinator visibility.
3. Coordinator resolves one dedicated appeal as `UPHELD` and another as `OVERTURNED` using existing terminal fixtures for read verification.
4. On overturn, verify disqualification is no longer active, status/rank can be restored only after recalculation, and audit/notifications exist.

Failures: appeal twice, appeal another team, empty note, resolve non-pending/terminal appeal, invalid decision, wrong role.

## W5-S07 — Publish results

1. Coordinator ranking page verifies grading locked, rankings current, advancement resolved and no blocking appeals.
2. Click publish action and confirm **Publish results?**.
3. Verify round/event `resultPublishedAt`, public standings, track/event leaderboards, participant scores and result announcement/notification.
4. Refresh and compare ordering with coordinator ranking.

Failures: publish with unlocked/incomplete grading, stale/missing ranking, unresolved ties/appeals, publish twice, wrong role. Public API must not leak draft judge comments/raw score sheets.

## W5-S08 — Prize assignment from ranking and manual award

1. Coordinator → **Awards** → select Summer event.
2. Review configured prizes and eligible ranking.
3. Assign/derive winners from ranking for one dedicated unawarded prize; verify team, awarded time and notification.
4. Use a separate prize for manual award; select team and enter **Reason (Recommended)**.
5. Clear an award only on a disposable prize and enter reason; then re-award if the scenario requires.
6. As Guest open `/events/{eventId}/awards`; verify published-safe winners.

Failures: team from another event/track, rank mismatch, award already awarded prize without clear, clear unawarded prize, award before results, duplicate same scoped rank, wrong role.

## W5-S09 — Export job happy paths

1. Coordinator sidebar → **Exports** or event exports.
2. Create each supported export type with valid event/round/track parameters: ranking, score report, anonymized score dataset, team list, calibration report and full event report as permitted.
3. Verify state sequence `QUEUED` → `PROCESSING` → `DONE` by refresh/polling.
4. Open detail and download metadata/file. Validate filename, content type, row count and columns.
5. Use event shortcut operations for ranking/score/team-list exports and verify they create normal export jobs.

Failures: missing/mismatched IDs, unsupported type, unauthorized event, download before `DONE`, unknown job, file unavailable.

## W5-S10 — Failed, retry, expired and delete exports

1. Filter seeded `FAILED` job, open error message and invoke retry. Expect new/updated queued work according to implementation; repeated concurrent retry must not duplicate work.
2. Open V19 expired `DONE` ranking export (`19000000…901`). Detail/list must work; download must reject expiry rather than return the invalid URL.
3. Delete only a disposable failed/completed job after evidence.

Failures: retry a processing/done non-retryable job, delete processing job, download failed/queued/expired, access another user’s export where ownership applies.

## W5-S11 — Export aliases and async integrity

Cover all three controllers/families:

- `/exports...` create/list/detail/download/retry/delete
- `/events/{eventId}/exports/...` shortcuts
- `/export-jobs/{jobId}` and download endpoints

For every alias compare job ID/status/owner and ensure access control is equivalent. Do not count aliases as separate business features, but do record each as a separate OpenAPI operation in the matrix.

## W5-S12 — Audit reconciliation

1. Open **Audit Logs** after ranking, advancement, DQ, publish, award and export actions.
2. Filter each action type and verify actor, target table/ID, before/after/context and timestamp.
3. Cross-check IDs with UI details and Network responses.
4. Confirm sensitive export parameters/tokens are not exposed unnecessarily.

## Week 5 completion checkpoint

- Ranking is deterministic, scoped and publication-safe.
- Tie/variance/advancement behavior and three previously missing advancement APIs are captured.
- DQ/appeal terminal paths and active-team-DQ query are captured.
- Award from ranking/manual/clear failures are captured.
- Every export family, state, retry, expiry, ownership and download boundary is captured.
- Sensitive outcomes have audit evidence.

