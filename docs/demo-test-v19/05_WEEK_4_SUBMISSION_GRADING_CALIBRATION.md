# Week 4 — Submission, judging, grading and calibration

## Goal and actors

Teams submit required deliverables; judges see only assigned work, calibrate, save drafts and finalize scores; mentor feedback is visible according to publication state; coordinator monitors progress, reopens when allowed and locks grading.

Accounts: `student4@seal.test` (Beta leader), Delta team leader from seed, `judge1@seal.test`, `judge3@seal.test`, `judge5@seal.test`, `mentor1@seal.test`, `coordinator@seal.test`.

## Data ownership

- **Beta Builders final DRAFT**: update, add/remove links, upload and submit-existing path.
- **Delta Vision final round with no submission**: create-new submit-deliverables path.
- **V18 live calibration**: score-sheet and submit calibration for judge1/judge5.
- **Closed unpublished calibration**: publish-distribution path.
- **judge5 final mobile assignment**: disposable unassign path after evidence.

## W4-S01 — Participant submission list and requirements

1. Login as `student4@seal.test`; `/participant/teams` → Beta Builders → submissions.
2. Select the current/open final round.
3. Verify deadline, round status, required link types, existing draft, submission history and edit permissions.
4. Confirm another team’s private draft is not accessible by changing `teamId` in URL/API.

Failures: unknown team/round, round belongs to another event, non-member, non-leader mutation, eliminated/unapproved team, deadline closed.

## W4-S02 — Update Beta draft and manage links

1. Open `/participant/teams/{betaId}/rounds/{finalRoundId}/submission`.
2. Update note and valid repository/demo/slides/report links as required by the Beta track.
3. Use **Save draft**; expect status remains `DRAFT` and updated timestamp changes.
4. Add another valid link, edit it, then remove only a disposable link; refresh after each action.
5. Check repository metadata response for GitHub/GitLab where integration is enabled; provider failure must not corrupt the draft.

**Failure checks**

- Invalid URL/scheme, unsupported link type, duplicate primary/order or missing required type: 400.
- Link/submission mismatch: 404/409.
- Edit another team’s draft: 403.
- Edit after submission lock/finalization: 409.

## W4-S03 — Multipart upload

1. On the Beta draft upload a small allowed PDF/ZIP/PPTX/PNG/JPEG/TXT file using the submission form.
2. Expect a submission-link row with storage provider, object key, original name, content type and size.
3. Refresh and confirm file metadata/download link.

Failures: empty file, unsupported executable/content type (415), file above configured 25 MB/30 MB limits (413), wrong team/round, no storage credentials. When S3 is intentionally unconfigured, document the controlled integration error and verify no half-created link.

## W4-S04 — Submit existing Beta draft

1. Verify every required link type exists and round is `OPEN` before deadline.
2. Click the final submit action and confirm.
3. Expect status `SUBMITTED` (or `LATE` only for an explicitly allowed late fixture), submission number/history and notification/audit side effect.
4. Reload participant list and coordinator submission detail.

Failures: submit twice, missing required links, after locked deadline, member without leader permission, invalid round/team relationship.

## W4-S05 — Create a new Delta submission

1. Login as the seeded Delta Vision leader.
2. Open the final round submission route; verify no existing submission.
3. Enter note and every required deliverable, then submit directly.
4. Expect one new submission, not duplicate draft + submitted rows; unique `(team_id, round_id)` remains intact.

Use Swagger to separately cover:

- `POST /teams/{teamId}/rounds/{roundId}/submissions/draft`
- `POST /teams/{teamId}/rounds/{roundId}/submissions`
- `POST /teams/{teamId}/rounds/{roundId}/submissions/files`

The supplied Fable portal omitted these operations; evidence is mandatory in the new run.

## W4-S06 — Coordinator submission search/detail

1. Login coordinator; sidebar → **Submissions**.
2. Filter Summer event, round, track and status; verify pagination.
3. Open Beta/Delta detail and inspect links, team, deadline, status and scoring readiness.
4. Attempt invalid event/round/track combinations: expect 400, not silent empty data when the service validates mismatch.

Authorization: Student cannot call coordinator list/detail (403); unknown submission (404).

## W4-S07 — Judge assignment queues and aliases

1. Login `judge1@seal.test`; sidebar → **Dashboard**, then **Assigned Submissions**.
2. Filter by round/status/track and open an assigned submission.
3. Verify summary counters and detail do not expose team identity beyond the blind-scoring design.
4. Cover both route families in Swagger because Fable omitted the `/judges/me` family:
   - `/judge/assignments` and judge UI endpoints
   - `/judges/me/assignments`
   - `/judges/me/submissions` and `/summary`
   - `/judges/me/rounds/{roundId}/submissions` and `/summary`
   - `/judges/me/submissions/{submissionId}`
5. Login judge2 and request judge1-only submission: 403/404 without leakage.

## W4-S08 — Save draft scores and finalize

1. As judge1 open an assigned submitted item → score page.
2. Verify the score sheet contains exactly the active criteria applicable to the round, with effective max score/rubric.
3. Enter in-range values/comments and save draft. Reload; values persist with `isDraft=true`.
4. Modify one value, save again and confirm update rather than duplicate score rows.
5. Submit/finalize the dedicated sheet. Reload; it is confirmed/locked according to service state and assignment progress increments once.

**Failure checks**

- Score below 0 or above criterion max, NaN/blank required value: 400.
- Missing criterion, duplicate criterion, criterion from other event: 400.
- Unassigned judge or submission not submitted: 403/409.
- Finalize incomplete sheet, finalize twice, edit locked score: 409.
- Judge cannot see another judge’s raw scores unless a coordinator endpoint explicitly allows it.

## W4-S09 — Coordinator grading progress, reopen and locks

1. Coordinator sidebar → **Grading Progress**; select event and drill into round.
2. Inspect total/assigned/submitted/confirmed/locked progress and assignment detail.
3. Open a submitted score sheet and use the supported reopen operation on a dedicated non-ranking-critical fixture.
4. Verify judge can edit after reopen and audit row records coordinator/reason.
5. Run submission grading-status and round grading-status endpoints.
6. Lock grading only after all required sheets in the chosen disposable round are finalized; verify timestamp/state.

Failures: lock with incomplete sheets, lock twice, reopen after ranking/publication where forbidden, reopen wrong judge/submission/round tuple, Student/Judge invokes coordinator endpoint.

## W4-S10 — Live calibration score

1. Login judge1; sidebar → **Calibration Tasks**.
2. Open the V18 live calibration (window `NOW()-1d` to `NOW()+6d`).
3. Verify sample submission, benchmark-hidden/visible behavior and all five active Summer criteria.
4. Enter valid values/comments and click the submit action; confirm **Submit calibration scores?**.
5. Reload `my-scores`; values persist once. Use judge5 for a second independent submission if needed.

Failures: judge not assigned/eligible, before start/after end, missing/duplicate/foreign criterion, score out of range, submit twice.

## W4-S11 — Calibration coordinator CRUD and distribution

1. Coordinator sidebar → **Calibration Rounds**.
2. Open/create a disposable calibration: event, sample submission, window, mandatory flag, description/name and complete benchmark mapping.
3. Edit it before scores exist.
4. Inspect score-sheet/distribution after judge data exists.
5. Publish distribution on the seeded closed/unpublished fixture, then verify judge distribution route.
6. Cover both alias families because 8 `/calibration-rounds...` operations were absent from Fable:
   - `/calibrations...`
   - `/calibration-rounds/{id}...`
   - `/events/{eventId}/calibration-rounds`

Failures: sample submission from another event, invalid window, incomplete benchmark, publish before end/no scores, publish twice, edit after publication, Judge uses coordinator mutation.

## W4-S12 — Mentor feedback in the grading context

1. Login mentor1; **Submissions** → assigned submission.
2. Create feedback tied to correct team/submission/round; keep one `DRAFT` and publish another.
3. Participant opens team/submission: only published/team-visible feedback appears.
4. Update then publish the older dedicated draft; delete only V18 second disposable draft.
5. Cover missing Fable endpoints `POST/GET /mentor-feedback/teams/{teamId}`.

Failures: unassigned mentor, mismatched submission/team, blank content, participant reads draft, edit/delete/publish terminal feedback twice.

## W4-S13 — Judge/mentor assignment removal

1. After queue screenshots, coordinator removes `judge5` final mobile assignment, which owns no submissions/scores.
2. After mentor screenshots, remove V18 `mentor3` disposable assignment.
3. Verify removed actor loses scope immediately.

Failure: remove an assignment with scores/locked obligations or wrong event; expect conflict and intact data.

## Week 4 completion checkpoint

- Create-new, save-draft, update-links, multipart upload and submit-existing paths captured.
- Both judge endpoint families and all missing Fable aliases captured.
- Draft/final/locked score transitions and bounds captured.
- Calibration CRUD/score/distribution captured.
- Mentor draft/public visibility captured.
- Destructive unassign used only dependency-free rows.

