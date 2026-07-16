# Validation report and known limits

## Scope inspected

- 33 Spring controllers and current service/domain rules
- 300 OpenAPI operations on 252 paths across 33 tags
- 485 Java source files and the full React feature/router/API surface
- Flyway V1–V17, supplied V18, and new V19
- Supplied 1,538-case test-plan portal and Fable `TEST_GUIDE_V18.md`

## Reconciliation results

| Check | Result |
|---|---|
| OpenAPI parse | PASS — YAML loads; 252 paths / 300 operations |
| Fable/test-plan API overlap | 261 operations present |
| Missing from supplied plan | 39 operations, now marked `NEW` in the matrix |
| Matrix control total | PASS — exactly 300 operation rows |
| Migration count | V1–V19 |
| V18/V19 literal foreign keys | PASS — 113 checked, 0 unresolved against 758 parsed insert rows |
| V19 enum/state review | PASS after correcting archive season to supported `FALL` |
| Frontend TypeScript | PASS after removing one pre-existing unused helper |
| Frontend production bundle | PASS — 2,161 modules transformed |
| Frontend lint (`src`) | FAIL — 264 pre-existing errors / 22 warnings (hooks, explicit `any`, etc.); full `eslint .` is further polluted by committed `.history` snapshots |
| Backend Maven compile | Not completed in this workspace: Spring parent/dependencies were not cached and Maven Central DNS was unavailable |
| Real PostgreSQL/Flyway execution | Must be run locally; no PostgreSQL server/client was available in this workspace |

## Corrections made

1. Added supplied `V18__seed_full_function_coverage.sql` to the actual Flyway migration folder and corrected its stale 267-endpoint header.
2. Added V19 read-mostly fixtures for `ARCHIVED`, `PENDING_LOCK`, `CLOSED`, `PARTIALLY_FAILED`, expired-download and inactive-RAG cases.
3. Corrected verification response/README: normal self-registration becomes `ACTIVE` immediately after valid e-mail verification.
4. Updated README migration references from 16 to 19.
5. Removed unused `getRegisteredTeamCount` so TypeScript strict build succeeds.
6. Added a generator that derives the full operation matrix directly from OpenAPI.

## Known product gaps/risks

- Several sidebar/router destinations intentionally render `NotFoundPage`; they are catalogued in `09_UI_ROUTE_GAPS_AND_API_ONLY_TESTS.md`.
- `/v3/api-docs` and `/v3/api-docs.yaml` may have different Spring Security allowlisting; JSON success does not guarantee the YAML alias is public.
- V16 requires PostgreSQL `vector` extension privileges. Prepare the extension as superuser or test the documented keyword/rule-based fallback.
- External mail, S3, GitHub/GitLab and AI provider success requires local credentials. The guide distinguishes controlled fallback/error from real integration success.
- The frontend production bundle is large (~2.39 MB uncompressed JS) and emits a code-splitting warning; this is performance debt, not a functional test blocker.
- The current frontend lint baseline is not clean. This package does not bulk-rewrite unrelated hooks/types; treat the 264 source errors as technical debt and exclude `.history` from lint/source control.
- The 1,538 supplied portal cases contain generic repeated steps and “Pass” claims without execution evidence. They are a reference, not proof.

## Required local release gate

Before presenting the result as executed rather than planned:

1. Recreate local PostgreSQL and run Flyway V1–V19.
2. Run backend compile/tests with dependencies available.
3. Run frontend build (already passed here) and lint.
4. Execute Weeks 1–6 in order and attach screenshots/Network/audit evidence.
5. Run the consolidated negative/security suite.
6. Regenerate the OpenAPI matrix and confirm 300 operations or reconcile any changed count.
