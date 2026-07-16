# Week 3 — Teams, participation and mentoring

## Goal and session setup

Demonstrate independent team-entry paths (create, invitation, join code and join request), team ownership, registration review and mentor visibility. Keep two sessions open: normal window for the leader/coordinator and Incognito for invited/requesting students.

All accounts use `Password@123`.

## Required mutation order

The order below prevents member-count tests from invalidating later success cases:

1. Create/delete the separate student57 team.
2. Sandbox leader updates/toggles/invites student58.
3. student58 accepts: Sandbox member count 4 → 5.
4. Leader removes student64: 5 → 4.
5. student63 leaves: 4 → 3.
6. student59 joins by code: 3 → 4.
7. student61 transfers leadership to student62.
8. New leader student62 registers the team for a track.

Do not delete Sandbox Wolves; use the separately created student57 team as the delete endpoint fixture.

## W3-S01 — Create, view, update and delete an empty team

1. Login as `student57@seal.test`; open `/participant/teams`.
2. Click create team and enter a unique **Team Name**, project title and description; submit.
3. Confirm the new detail page, leader role, `FORMING` state, member count 1 and join code.
4. Edit name/project/description; refresh and verify.
5. Before inviting/registering anyone, use **Delete Team**, enter **Reason**, confirm, and verify the team disappears.

**Failure checks**

- Duplicate/blank/overlong name: 400/409.
- Create a second active team where the business rule forbids it: 409.
- A non-leader PATCH/DELETE by `student58`: 403.
- Delete a registered/scored/core team: 409.

## W3-S02 — Inspect Sandbox Wolves and join-code controls

1. Login as leader `student61@seal.test`; `/participant/teams` → **Sandbox Wolves**.
2. Verify four active members, no track, `FORMING`, code `SBOX26` and **Track Registration** tab.
3. Edit allowed team fields and save.
4. Toggle join code off, then in Incognito as `student59` enter `SBOX26` from `/participant/teams`; expect disabled-code failure.
5. Toggle it on again. Preview code as student59; expect Sandbox name/member capacity without leaking private member data.

Failures: wrong code (404), disabled code (400/409), non-leader toggle (403), unknown team (404).

## W3-S03 — Invite a member and accept

1. As student61 on team detail click **Invite Member**.
2. Enter `student58@seal.test`, optional message, and submit. Expect one live `PENDING` invitation.
3. Incognito login as `student58`; open `/participant/invitations`.
4. Open the Sandbox invitation and accept. Refresh both sessions: status `ACCEPTED`, student58 in roster, count 5.

**Independent invitation states**

- Accept fixture: `token-pending-alpha-live` (only if its target is still free for the chosen run).
- Reject fixture: `token-pending-beta-reject` using `reset.expired@seal.test`.
- Cancel fixture: `token-pending-gamma-cancel` by its team leader.

Run reject and cancel on their own rows; do not reuse the accepted row.

**Failure checks**

- Invite existing member, user already in another active team, duplicate pending invite, inactive/non-student, or full team: 409.
- Non-leader invite/cancel: 403.
- Accept/reject expired, cancelled or already-responded token: 400/409.
- Token detail must not allow an unrelated user to mutate an ID-based invitation.

## W3-S04 — Remove and leave while preserving minimum size

1. As student61 remove student64 from Sandbox. Confirm active roster/count 5 → 4 and historical member has a leave reason.
2. Incognito login as student63; open Sandbox and choose leave. Confirm count 4 → 3.
3. Refresh leader page and confirm remaining student61, student62 and student58.

Failures: remove the leader, remove unknown/non-active member, non-leader removes, leader leaves while active members remain, repeated remove/leave.

## W3-S05 — Join by code

1. Login as free `student59@seal.test`; `/participant/teams`.
2. Enter **Team Join Code** `SBOX26`; review preview and confirm join.
3. Expect active member row and Sandbox count 3 → 4.

Failures: wrong/disabled code, already a member, user already on another active team, full/registered/non-forming team, suspended account.

## W3-S06 — Transfer leadership

1. As student61 open Sandbox roster and transfer leadership to active member `student62`.
2. Refresh both sessions: student62 is `LEADER`, student61 becomes `MEMBER`, team `leader_id` matches.
3. Continue all leader-only Sandbox actions as `student62`.

Failures: transfer to non-member/inactive member/self where rejected, old leader repeats privileged action (403), new leader missing token (401).

## W3-S07 — Forming-team discovery and join request

1. Login as free `student60@seal.test`; browse forming teams (`GET /teams/forming` through the participant UI/API).
2. Select **Summer Formers** and send a join request with a short message.
3. Confirm the request appears in `/teams/join-requests/me` as `PENDING`.
4. Login as the Summer Formers leader; team detail → **Join Requests**; open the request.
5. Accept one dedicated request. On a separate fixture/request, test reject with a reason.
6. Verify notification to requester/leader and updated roster only for accepted request.

Failures: duplicate pending request, full/registered team, requester already in team, inactive/non-student, non-leader accept/reject, expired/already-processed token.

## W3-S08 — Register Sandbox Wolves for a track

1. Login as new leader `student62`; Sandbox → **Track Registration**.
2. Select an available Summer track whose member limits accept count 4.
3. Review **Confirm Registration** and submit.
4. Expect team status/registration state to move to `REGISTERED` / `PENDING_APPROVAL`, not directly to competing.

Failures: fewer than min or greater than max members, track full, outside registration window, track from wrong event, duplicate registration, non-leader.

## W3-S09 — Coordinator team registration review

Use seeded teams so this remains replayable even if Sandbox timing differs.

1. Login `coordinator@seal.test`; sidebar → **Teams**.
2. Filter registration status `PENDING_APPROVAL`.
3. Open **Approval Pending Crew**; approve once. Expect `APPROVED` and business team state updated as implemented.
4. Open **Approval Reject Crew**; reject once with a clear non-empty reason. Expect `REJECTED` and reason visible to the team.
5. Verify audit/notification rows for both decisions.

Failures: approve/reject twice, reject without reason, team no longer meets member rule, inactive member, maximum approved team capacity reached, track/event mismatch, Student/Judge actor.

## W3-S10 — Competition and participant views

1. As participant open `/events/{eventId}/competing` or `/participant/events/{eventId}/competing` for Summer 2026.
2. Verify own eligible team, current round, deadlines, submission/advancement actions and public-safe competition information.
3. Open team advancement and published scores routes; unpublished data must not leak.

Failures: participant requests another private team’s unpublished scores/advancement, event outside competition window, eliminated/unapproved team attempts protected action.

## W3-S11 — Mentor team access and feedback boundary

1. Login `mentor1@seal.test`; sidebar → **Teams**.
2. Open an assigned team; inspect roster, event/track, submissions and progress.
3. Sidebar → **Submissions**; open an assigned submission.
4. Create a draft feedback, edit it, then publish one dedicated row. Use V18 second draft as the delete target.
5. Login `mentor2@seal.test` and attempt the same unassigned team/submission: expect 403.

Failures: non-assigned mentor, feedback for mismatched team/submission/round, blank content, edit/delete published feedback, publish twice, Student actor.

## Week 3 completion checkpoint

- Create/delete, invite, accept/reject/cancel, join code and join-request paths captured independently.
- Member counts and leadership remain consistent after refresh.
- Track registration and coordinator approve/reject have dedicated rows.
- Mentor access is limited to assignments.
- No core scored team was deleted or structurally modified.

