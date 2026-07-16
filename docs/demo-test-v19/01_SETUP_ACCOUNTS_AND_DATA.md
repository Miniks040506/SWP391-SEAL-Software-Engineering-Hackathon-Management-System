# Environment, accounts and demo data

## 1. Local prerequisites

- Java 21
- PostgreSQL 15+ with a database named `seal_hackathon`
- Node.js supported by Vite 8 and npm
- Optional `vector` extension. V16 creates it when PostgreSQL permits; AI can fall back to keyword/rule-based behavior.

## 2. Reset and migrate a local demo database

Only do this on a disposable local database. Never run `DROP DATABASE` against shared or production data.

```bash
dropdb --if-exists seal_hackathon
createdb seal_hackathon
```

Set at minimum:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD='<local-postgres-password>'
export JWT_SECRET='<at-least-32-byte-local-secret>'
export JWT_HEADER=Authorization
export FRONTEND_URL=http://localhost:5173
```

Start backend from `backend/SEAL Hackathon`:

```bash
./mvnw spring-boot:run
```

Flyway must report V1 through V19 applied successfully. Because V18/V19 contain relative timestamps, reset close to the demo day so “live” windows remain live.

Start frontend from `frontend/Seal_Hackathon`:

```bash
npm install
npm run dev
```

Open:

- Product: `http://localhost:5173`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- OpenAPI YAML: request `Accept: application/yaml` from `/v3/api-docs` or configure a public YAML alias; the current security configuration may protect `/v3/api-docs.yaml` separately.

## 3. Smoke check before testing

1. Open `/events`; the public event list must render without a token.
2. Log in with `admin@seal.test` / `Password@123`; `/admin/dashboard` must load.
3. Open `/admin/health`; database status must be healthy.
4. Open Swagger UI and call `GET /api/v1/events`; expect 200.
5. Call a protected endpoint without `Authorize`; expect 401.
6. Confirm Flyway history ends at V19.

## 4. Primary account catalog

| Purpose | Account | Role/status | Use in demo |
|---|---|---|---|
| System administration | `admin@seal.test` | ADMIN / ACTIVE | users, config, health, AI knowledge/safety, audit, exports |
| Main organizer | `coordinator@seal.test` | COORDINATOR / ACTIVE | event lifecycle, teams, grading, rankings, awards, reminders |
| Disposable-event owner | `coordinator2@seal.test` | COORDINATOR / ACTIVE | delete/cancel V18 events without touching the main event |
| Internal judge | `judge1@seal.test` | JUDGE / ACTIVE | live calibration and web-track score sheet |
| Second judge | `judge2@seal.test` | JUDGE / ACTIVE | cross-judge visibility/assignment failures |
| Guest judge with historical scores | `judge3@seal.test` | JUDGE / ACTIVE | calibration distribution and AI-track judging |
| Expired guest judge | `judge4@seal.test` | JUDGE / ACTIVE user, expired judge profile | expiry scheduler/login/assignment rejection |
| Live temporary guest judge | `judge5@seal.test` | JUDGE / ACTIVE | mobile assignment and disposable unassign test |
| Main mentor | `mentor1@seal.test` | MENTOR / ACTIVE | teams, submissions, create/update/publish feedback |
| Other-track mentor | `mentor2@seal.test` | MENTOR / ACTIVE | forbidden access to unassigned team |
| Disposable mentor assignment | `mentor3@seal.test` | MENTOR / ACTIVE | remove-assignment scenario |
| Stable participant | `student1@seal.test` | STUDENT / ACTIVE | public/participant views, profile, AI assistant |
| Beta Builders leader | `student4@seal.test` | STUDENT / ACTIVE | edit/submit V18 Beta final draft |
| Create-team actor | `student57@seal.test` | STUDENT / ACTIVE | create a fresh disposable team |
| Invite target | `student58@seal.test` | STUDENT / ACTIVE | receive team invitation |
| Join-code actor | `student59@seal.test` | STUDENT / ACTIVE | join by `SBOX26` |
| Join-request actor | `student60@seal.test` | STUDENT / ACTIVE | request to join Summer Formers |
| Sandbox leader | `student61@seal.test` | STUDENT / ACTIVE | mutate Sandbox Wolves |
| Sandbox members | `student62@seal.test`–`student64@seal.test` | STUDENT / ACTIVE | remove/leave/transfer tests |
| Spring extra member | `student65@seal.test` | STUDENT / ACTIVE | track min-member fixture |
| Inbox sacrifice | `student66@seal.test` | STUDENT / ACTIVE | read/delete/clear notification tests |
| Reject-registration team | `student67@seal.test`–`student69@seal.test` | STUDENT / ACTIVE | Approval Reject Crew |
| Legacy approval success | `pending.student@seal.test` | STUDENT / PENDING_APPROVAL | coordinator approves this fixture |
| Legacy approval reject | `pending2.student@seal.test` | STUDENT / PENDING_APPROVAL | coordinator rejects this fixture |
| Suspension failure | `suspended.student@seal.test` | STUDENT / SUSPENDED | login/refresh rejection |
| Verification failure | `unverified.student@seal.test` | STUDENT / UNVERIFIED | login denied / resend verification |
| Locked login | `locked.student@seal.test` | STUDENT / ACTIVE but temporarily locked | lockout response |
| Deactivation failure | `deactivated.student@seal.test` | STUDENT / DEACTIVATED | login/refresh rejection |
| Deactivation target | `deactivate.me@seal.test` | STUDENT / ACTIVE | final destructive deactivate test |
| Reset success | `reset.active@seal.test` | STUDENT / ACTIVE | valid password-reset token fixture |
| Reset expiry | `reset.expired@seal.test` | STUDENT / ACTIVE | expired-token failure |

All rows above use password `Password@123`, except after the password-change/reset scenario. Reset the database before replaying that scenario.

## 5. Business data anchors

| Fixture | Purpose | Mutation policy |
|---|---|---|
| `SEAL Summer 2026` | Main live event; teams, rounds, scores, results | Read and progress only in the documented chain; never delete |
| `SEAL Spring 2025` | Completed historical rankings/tie/public results | Read-only |
| `SEAL Fall 2026` | Draft/configuration and expired-open-round checks | Use only named disposable children |
| `SEAL Fall 2027 (Delete Me)` | Event delete success | Delete at the very end of Week 2 |
| `SEAL Spring 2027 (Cancel Me)` | Event status/cancel success | Cancel after update/status tests |
| `SEAL Fall 2024 Archive` | ARCHIVED event and terminal round filters | Strictly read-only |
| `Sandbox Wolves`, join code `SBOX26` | Team mutation sandbox | Destructive actions allowed in Week 3 order |
| `Approval Pending Crew` | Coordinator approve registration | Approve once |
| `Approval Reject Crew` | Coordinator reject registration | Reject once with a reason |
| `Beta Builders` final draft | Update links and submit existing draft | Submit once in Week 4 |
| `Delta Vision` final slot | Create-new submission happy path | Submit once in Week 4 |
| V18 live calibration | Judge score and distribution flow | judge1/judge5 score once; publish separate closed fixture |
| V19 partial notification | `PARTIALLY_FAILED` filter/detail | Read-only |
| V19 expired export | download-expired failure | Read-only; do not retry/delete before evidence |

## 6. Fresh registration data

Use a unique address each run, such as `demo.student+<timestamp>@example.com`. The flow is:

`Register` → status `UNVERIFIED` → enter valid six-digit code → `User.verifyEmail()` sets `emailVerifiedAt` and status `ACTIVE` immediately → login succeeds.

No coordinator approval is required for normal self-registration. The approval screens/APIs are retained only for manually created or legacy `PENDING_APPROVAL` accounts.

## 7. Two execution modes

- **UI mode:** use the route and exact visible labels documented in Weeks 1–6.
- **API mode:** Swagger UI → `Authorize` with `Bearer <accessToken>` → expand operation → `Try it out` → supply seeded UUID/payload → `Execute`. Use API mode for aliases, schedulers, multipart boundaries, and operations with no current screen.
