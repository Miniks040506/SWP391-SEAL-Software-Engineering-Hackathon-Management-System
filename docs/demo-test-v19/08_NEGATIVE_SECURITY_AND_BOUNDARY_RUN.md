# Consolidated negative, security and boundary run

Run this after Weeks 1–6 success evidence and before final destructive cleanup. For each row verify both the status/error and that no data was mutated.

## Authentication and authorization baseline

For every protected operation in `10_FULL_300_API_OPERATION_MATRIX.md`:

1. Call without `Authorization`: expect 401.
2. Call with malformed/expired/blacklisted token: expect 401.
3. Call with a valid token from the wrong role: expect 403.
4. Call with the correct role but a resource owned by another user/event: expect 403 or non-leaking 404.
5. Repeat one-time mutations: expect 400/404/409, never duplicate data or 500.

## Cross-role checks

| Resource/action | Correct actor | Wrong actor to test | Expected |
|---|---|---|---|
| User/system/AI admin | Admin | Student | 403 |
| Event/round/track/criteria mutation | Coordinator | Judge/Student | 403 |
| Team leader mutation | Current leader | Other member/non-member | 403 |
| Invitation/join-request response | Target/leader as designed | Unrelated student | 403/404 |
| Assigned score sheet | Assigned judge | Other judge | 403/404 |
| Mentor feedback | Assigned mentor | Other mentor | 403 |
| Ranking/publish/award/DQ | Coordinator | Judge/Student | 403 |
| Own inbox/conversation/export | Owner | Other active user | 403/404 |

## Input validation checklist

Apply to each relevant DTO/parameter:

- null, missing and blank required fields;
- leading/trailing whitespace and case normalization;
- min−1, min, max, max+1 lengths/values;
- zero, negative, decimals, integer overflow and invalid enum;
- malformed UUID and well-formed unknown UUID;
- event/track/round/team IDs that exist but do not belong together;
- duplicate unique values and repeated idempotent request;
- invalid URL scheme, MIME type, file extension and oversized multipart body;
- timestamps equal, reversed, in the past and outside parent windows;
- pagination page/size below/above bounds and unknown sort field;
- HTML/script payload, Unicode/Vietnamese, emoji and SQL-like text.

## State-transition boundaries

| Domain | Legal success to capture | Illegal transition examples |
|---|---|---|
| User | `UNVERIFIED → ACTIVE` on verify | verify active, login suspended/deactivated, approve active |
| Event | configured forward lifecycle/cancel | terminal → earlier state, cancel twice, delete non-empty |
| Round | upcoming/open → pending lock/closed/judging/results | close twice, edit/delete locked, publish before grading |
| Team | forming → registered → approval | register undersized/full/outside window, review twice |
| Invitation/request | pending → accepted/rejected/cancelled/expired | respond twice or after expiry |
| Submission | draft → submitted/late → locked | incomplete submit, edit/finalize twice, wrong round |
| Score | draft → finalized → locked; optional coordinator reopen | out-of-range, incomplete finalize, edit locked |
| Calibration | scheduled/live → scored → distribution published | outside window, duplicate score, early/double publish |
| Ranking | calculate → preview → confirm → publish | incomplete grading, unresolved tie, confirm/publish twice |
| DQ appeal | none → DQ → pending appeal → upheld/overturned | appeal/resolve twice or wrong owner |
| Export | queued → processing → done/failed → retry/delete | download non-done/expired, retry done, delete processing |
| Notification | draft/scheduled → processing → terminal | past schedule, send twice, cross-user inbox mutation |

## Concurrency tests

Use two sessions/API requests released together; verify a single winner and database uniqueness:

1. Two students take the final team slot.
2. Two leaders accept the same join request/invitation.
3. Two coordinators approve/reject the same pending registration.
4. Two judges/finalize calls for the same score sheet.
5. Two coordinators lock/recalculate/confirm/publish the same round.
6. Two retry calls for one failed export.
7. Scheduler and manual send dispatch the same notification.

Expected: one success; the other controlled conflict/idempotent response; counts, status and audit remain consistent.

## Data privacy checks

- No password hash, verification/reset token, JWT, OAuth provider token or decrypted config secret in API/UI/logs.
- Blind judge view does not reveal restricted team identity.
- Participant cannot see another team’s draft, raw judge sheet, unpublished ranking or draft mentor feedback.
- Anonymized export has no direct judge/team identifiers.
- AI safety logs store decision/reason/hash, not credentials or unnecessary private text.
- Error 403/404 does not reveal whether another user’s private resource exists.

## Error contract checks

For 400/401/403/404/409/413/415/500 responses verify the project error envelope fields (`success`, `status`, `error`, `message`, `path`, `timestamp`, `fieldErrors`) and that OpenAPI describes the returned code. Any undocumented status is a documentation defect even if the business rejection is correct.

## Final destructive cleanup order

1. Delete sacrificial inbox rows and disposable mentor feedback.
2. Remove dependency-free judge/mentor assignments.
3. Delete disposable criterion/track/prize/rule only after their scenarios.
4. Delete the student57 empty team.
5. Deactivate `deactivate.me@seal.test`.
6. Cancel Spring 2027 and delete Fall 2027 disposable events.
7. Never delete Summer 2026, Spring 2025, V19 archive or core scored teams.

