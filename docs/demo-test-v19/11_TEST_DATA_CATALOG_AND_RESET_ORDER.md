# Test-data catalog, ownership and reset order

## Seed design

- V1–V6 create the schema and six-module baseline.
- V7–V16 add password history, lifecycle/research fields, audit hardening, period fields, reminder dedupe, registration review, tie flags and pgvector embeddings.
- V17 repairs stale time windows and adds auth/tie/appeal/AI/announcement coverage.
- V18 adds disposable actors and mutable happy-path fixtures.
- V19 adds read-mostly status/error fixtures found during the 300-operation reconciliation.

V18/V19 use deterministic UUID namespaces `18...` and `19...`. All live dates use `NOW()` relative windows where business behavior depends on time.

## V18 mutable fixture IDs

| Fixture | ID/token | Owner/account | Allowed use |
|---|---|---|---|
| student57–69 | `18000000…057`–`…069` | corresponding e-mail | free/member actors |
| pending2 student | `18000000…070` | `pending2.student@seal.test` | reject legacy approval once |
| deactivate target | `18000000…071` | `deactivate.me@seal.test` | deactivate at end |
| Sandbox Wolves | `18000000…201` / `SBOX26` | initially student61 | team mutation chain; do not use as core scoring team |
| Approval Reject Crew | `18000000…202` | student67 | coordinator reject registration |
| Live calibration | `18000000…301` | coordinator/judges | judge scores/distribution reads |
| Final web judge assignment | `18000000…321` | judge1 | scoring queue |
| Final AI assignment | `18000000…322` | judge3 | scoring queue |
| Disposable mobile assignment | `18000000…323` | judge5 | remove only after evidence |
| Beta final draft | `18000000…401` | Beta leader student4 | update/upload/submit existing |
| DRAFT notification | V18 `…501` range | coordinator | send-now test |
| Expired Open Round | `18000000…601` | coordinator | scheduler/close target |
| Fall 2027 Delete Me | `18000000…701` | coordinator2 | event delete target |
| Spring 2027 Cancel Me | `18000000…702` | coordinator2 | lifecycle/cancel target |
| Throwaway Track | `18000000…801` | coordinator | update/delete |
| Draft Custom Criterion | `18000000…802` | coordinator | update/delete |
| Deprecated Sample Criterion | `18000000…803` | admin/coordinator | activate/deactivate/delete |
| Disposable rank-4 prize | `18000000…804` | coordinator | update/delete/negative award |
| Final TOP_N rule | `18000000…805` | coordinator | keep; final advancement |
| Disposable wildcard rule | `18000000…806` | coordinator | update/delete |
| Disposable mentor assignment | `18000000…807` | mentor3 | remove |
| Disposable mentor feedback | `18000000…808` | mentor1 | delete |
| Reject invitation | `token-pending-beta-reject` | target reset.expired | reject only |
| Cancel invitation | `token-pending-gamma-cancel` | Gamma leader | cancel only |

## V19 read-mostly fixture IDs

| Fixture | ID | Expected use |
|---|---|---|
| Fall 2024 archive | `19000000…701` | `ARCHIVED` event filter/detail and forbidden mutation |
| Pending-lock snapshot | `19000000…711` | round `PENDING_LOCK` filter; never advance |
| Closed snapshot | `19000000…712` | round `CLOSED` filter/forbidden mutation |
| Partial notification | `19000000…801` | `PARTIALLY_FAILED` detail/filter |
| Partial recipients | `19000000…811`, `…812` | read/unread recipient state |
| Failed outbox/log | `19000000…821`, `…831` | delivery failure detail |
| Expired done export | `19000000…901` | list/detail success, download expiry failure |
| Inactive AI document/chunk | `19000000…a01`, `…a11` | inactive RAG filtering |

## Core fixtures that must remain stable

- Summer 2026 event, tracks, rounds and baseline rankings/scores.
- Spring 2025 historical event, engineered ranking tie and published results.
- Alpha/Beta/Gamma/Delta and other scored teams except the explicit Beta final draft mutation.
- Existing `UPHELD`/`OVERTURNED` appeal rows.
- Published announcements and awarded prizes used for public views.
- Append-only audit history.

## Before-run integrity queries

Run in a local SQL client:

```sql
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;

SELECT status, count(*) FROM users GROUP BY status ORDER BY status;
SELECT status, count(*) FROM hackathon_events GROUP BY status ORDER BY status;
SELECT status, count(*) FROM rounds GROUP BY status ORDER BY status;
SELECT status, count(*) FROM teams GROUP BY status ORDER BY status;
SELECT status, count(*) FROM submissions GROUP BY status ORDER BY status;
SELECT status, count(*) FROM notifications GROUP BY status ORDER BY status;
SELECT status, count(*) FROM export_jobs GROUP BY status ORDER BY status;

SELECT team_id, count(*) AS active_members
FROM team_member
WHERE left_at IS NULL
GROUP BY team_id;

SELECT team_id, round_id, count(*)
FROM submissions
GROUP BY team_id, round_id
HAVING count(*) > 1;

SELECT submission_id, judge_id, event_criteria_id, count(*)
FROM scores
GROUP BY submission_id, judge_id, event_criteria_id
HAVING count(*) > 1;
```

The last two duplicate queries must return no rows.

## After-step consistency checks

After a team mutation compare `teams.member_count` with active `team_member` count. After scoring compare assignment progress with distinct submissions having finalized scores. After ranking compare one row per `(submission, round)`. After notification dispatch compare `recipient_count` with recipient rows and enforce unique `(notification_id,user_id)`. After export retry verify no impossible parallel jobs for the same idempotent request.

## Reset choices

### Full replay

Drop/recreate the disposable local database and restart backend. Flyway replays V1–V19 and restores every account/password/relative window.

### Partial replay

Do not manually “undo” complex ranking/advancement/publish/DQ changes. A partial reset is acceptable only for isolated disposable rows and must preserve foreign keys/audit. The preferred method for presentation rehearsal is always a full local rebuild.

## Mutation reservation table

Before a team run, assign one person/session to each mutable fixture. Never let two testers use the same pending invitation, score sheet, calibration judge, approval row, DQ appeal, award or failed export. Concurrency tests are the only exception and must be deliberately synchronized.

## Coverage control

Run:

```bash
python tools/generate_demo_coverage_matrix.py
```

The generated document must say **300 operations**. If it changes, regenerate the guide/matrix and add a success fixture plus validation, authorization and state-failure scenario for every new operation before claiming full functional coverage.
