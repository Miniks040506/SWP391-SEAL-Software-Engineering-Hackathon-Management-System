# SEAL full-product demo and test guide

## What this package covers

This guide was rebuilt from the current frontend routes, frontend API clients, 33 backend controllers, service business rules, OpenAPI file, Flyway V1–V19 data, and the supplied test-plan portal. The executable REST inventory is **300 operations on 252 paths**. The supplied Fable/V18 material covered 261 of those operations; the new matrix adds the missing 39.

“100% coverage” in this package means every implemented OpenAPI operation and every visible product feature has at least one named success scenario, authorization check, validation/state failure check, and a known fixture or creation step. It does **not** claim 100% Java/TypeScript line or branch coverage; that requires automated instrumentation such as JaCoCo/Vitest and actual execution evidence.

## Files and recommended order

1. `01_SETUP_ACCOUNTS_AND_DATA.md` — reset database, start FE/BE, accounts, fixture ownership and rules.
2. `02_WEEK_1_ACCESS_USERS_SYSTEM.md` — register → verify → active login; users, profile, system config and audit.
3. `03_WEEK_2_EVENT_CONFIGURATION.md` — event, tracks, criteria, rounds, judges, mentors and announcements.
4. `04_WEEK_3_TEAMS_AND_PARTICIPATION.md` — create team, invitation, join request/code, track registration and mentoring.
5. `05_WEEK_4_SUBMISSION_GRADING_CALIBRATION.md` — submission, uploads, judge queues, scoring, locks and calibration.
6. `06_WEEK_5_RESULTS_AWARDS_EXPORTS.md` — ranking, advancement, disqualification, prizes, publishing and exports.
7. `07_WEEK_6_NOTIFICATIONS_REMINDERS_AI.md` — inbox, reminders, assistant, RAG administration and safety logs.
8. `08_NEGATIVE_SECURITY_AND_BOUNDARY_RUN.md` — consolidated failure-first regression run.
9. `09_UI_ROUTE_GAPS_AND_API_ONLY_TESTS.md` — screens that really exist, `NotFound` placeholders, and API-only work.
10. `10_FULL_300_API_OPERATION_MATRIX.md` — audit trail for every OpenAPI operation.
11. `11_TEST_DATA_CATALOG_AND_RESET_ORDER.md` — fixture IDs, mutation ownership and destructive-test order.

## Six-week product story

| Week | Business outcome | Main actors |
|---:|---|---|
| 1 | A student registers, verifies e-mail, becomes `ACTIVE` immediately and manages the account safely. | Guest, Student, Coordinator, Admin |
| 2 | The organizer configures the event lifecycle, competition structure and evaluation model. | Coordinator, Admin |
| 3 | Students form teams, invite/join members, register a track and receive mentor support. | Student, Coordinator, Mentor |
| 4 | Teams submit deliverables; judges calibrate, score and finalize; coordinator monitors and locks grading. | Student, Judge, Mentor, Coordinator |
| 5 | Coordinator calculates rankings, resolves ties/disqualifications, confirms advancement, publishes results and awards. | Coordinator, Student, Public |
| 6 | System communicates deadlines/results and provides a guarded, auditable AI assistant. | All roles, Admin |

## Rules for a repeatable demo

- Use Chrome/Edge normal window for the primary actor and an Incognito window for the second actor. Do not keep switching roles in one local-storage session.
- All supplied accounts use `Password@123` unless a scenario explicitly changes the password.
- Run success cases before failure cases, but run delete/deactivate/cancel/lock/publish actions only at the marked end of a section.
- Never use a core team or historical ranking as a delete target. Use only rows whose names contain `Sandbox`, `Disposable`, `Throwaway`, `Delete Me`, `Cancel Me`, or the V18/V19 IDs listed in the catalog.
- Refresh the page after each state-changing action and verify the list/detail page, notification/audit side effect, and relevant API response.
- When a button is not rendered by the current frontend, use Swagger UI or an API client. Do not claim that it was tested through the UI.

## Definition of pass

A scenario passes only when all applicable checks hold:

1. HTTP status and response schema match OpenAPI.
2. Visible UI message and refreshed state match the service rule.
3. No unrelated fixture changed.
4. A sensitive mutation has the expected audit/notification side effect.
5. Repeating a one-time action returns a controlled 400/404/409 rather than silently duplicating data.
6. A missing token returns 401 and a valid token with the wrong role returns 403.

## Evidence to capture

For each numbered scenario, save: before screenshot, submitted values, after screenshot, Network response status/body, and the related Audit Logs or Notifications row. Name evidence `W<week>-S<scenario>-<PASS|FAIL>-<short-name>`.

