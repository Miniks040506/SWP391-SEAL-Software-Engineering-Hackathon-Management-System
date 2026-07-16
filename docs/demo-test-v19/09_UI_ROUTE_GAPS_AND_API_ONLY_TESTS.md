# Frontend route reality and API-only tests

## Why this file exists

The supplied portal marks many generic UI cases “Pass”, but the current router explicitly maps some sidebar links to `NotFoundPage`. Those are not implemented product screens. They must be reported as known frontend gaps, while their backend capability—if present—is tested through Swagger/API.

## Implemented role routes used by this guide

| Role | Working areas |
|---|---|
| Public | Events/explore, event detail/competition/awards, standings and leaderboards |
| Participant | Teams/create/detail/registration, invitations/join responses, submissions, advancement, scores, DQ and notifications |
| Coordinator | Dashboard, events/edit, prizes/awards, criteria, rounds/rules/advancement, grading progress, DQ, rankings, variance, reminders, calibrations, users, teams, submissions, announcements, notifications, exports, profile and audit |
| Admin | Dashboard, users, audit, notifications, system config/health, criteria, exports, AI knowledge/safety and profile |
| Judge | Dashboard, assigned submissions/detail/score, scoring, calibrations/distribution, criteria, notifications and profile |
| Mentor | Dashboard, teams/detail, submissions/detail, notifications and profile |

## Explicit `NotFoundPage` routes

| Sidebar/route | Current state | Demo instruction |
|---|---|---|
| Coordinator `/coordinator/judging` | Placeholder | Use **Grading Progress**, Submissions and judge-assignment APIs |
| Coordinator `/coordinator/analytics` | Placeholder | Use event variance dashboard and export/RBL APIs |
| Coordinator `/coordinator/schedule` | Placeholder | Use event/round editor and Reminders |
| Coordinator `/coordinator/settings` | Placeholder | Use Profile; admin uses System Config |
| Admin `/admin/users/create` | Placeholder route | Use **Users → Create New User** dialog on `/admin/users` |
| Admin `/admin/users/:id` and `/edit` | Placeholder routes | Use row view/edit dialogs on `/admin/users` |
| Admin `/admin/roles` | Placeholder | Role values are managed through user dialog/API, not a role catalog screen |
| Admin `/admin/permissions` | Placeholder | Authorization is backend role/ownership guards; test via 401/403 matrix |
| Admin `/admin/settings` | Placeholder | Use **System Config** and Profile |
| Judge `/judge/events` | Placeholder | Use Dashboard/Assigned Submissions and public Events |
| Judge `/judge/schedule` | Placeholder | Use assignments/calibration list and reminder APIs as authorized |
| Judge `/judge/settings` | Placeholder | Use Profile |
| Mentor `/mentor/schedule` | Placeholder | Use Teams/Submissions and notifications |
| Mentor `/mentor/settings` | Placeholder | Use Profile |

Do not click these routes in the polished happy-path demo unless the purpose is to show a known gap.

## API operations newly missing from Fable portal

The old plan contains 261 unique API endpoints. The current OpenAPI contains 300. These 39 must be executed in Swagger/API even when the frontend uses another alias:

- AI knowledge reindex: 1
- Audit aliases: 6
- Calibration `/calibration-rounds` and event aliases: 8
- Coordinator score-sheet reopen: 1
- Team registration approve/reject: 2
- Active team disqualification: 1
- Grading `my-scores`: 1
- Judge `/judges/me` queues/detail/summary: 6
- Mentor team feedback create/list: 2
- Round grading status and advancement preview/suggestions/confirm: 4
- Team+round submission create/draft/file: 3
- Team delete, advancement status and invite: 3

Exact rows, paths, accounts, fixtures and declared responses are marked `Source = NEW` in `10_FULL_300_API_OPERATION_MATRIX.md`.

## How to demo an API-only operation

1. Login with the documented account in the frontend and copy access token from local auth state/Network response, or call login in Swagger.
2. Open `/swagger-ui.html` → **Authorize** → `Bearer <token>`.
3. Locate the exact tag/path from the matrix → **Try it out**.
4. Use the named V18/V19 fixture and valid request example from OpenAPI.
5. Execute success; capture response and refreshed UI/list side effect.
6. Execute invalid state/payload and wrong-role token; capture controlled error and unchanged state.

## OpenAPI JSON/YAML note

`/v3/api-docs` working while `/v3/api-docs.yaml` returns 401 is a security-path allowlist issue, not proof that YAML generation is unavailable. A robust automatic export is:

```bash
curl -fsS http://localhost:8080/v3/api-docs \
  -H 'Accept: application/yaml' \
  -o docs/openapi/openapi.yaml
```

If the server still returns JSON for content negotiation, convert in a build task or explicitly permit/map the YAML endpoint in Spring Security. Always validate the exported file and confirm it still contains 300 operations.

