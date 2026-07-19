# Module 4 — Submission, Provider Integrations, Grading và Calibration

> Baseline: SEAL V24.  
> Đây là module thay đổi nhiều nhất so với `demo-test-v19`: thêm authoritative requirements, Google Drive/GitHub OAuth, provider evidence identity, immutable submission attempts, resubmit và optimistic score version.

## 1. Mục tiêu

Chứng minh end-to-end:

1. Participant biết chính xác cần nộp gì và vì sao chưa được submit.
2. Evidence được thêm bằng URL, local file, Google Drive hoặc GitHub.
3. GitHub ref được resolve thành immutable commit SHA.
4. File Drive được import/snapshot trước khi dùng để chấm.
5. Mỗi lần finalize tạo immutable attempt; resubmit không sửa lịch sử cũ.
6. Judge chỉ thấy assigned/blind submission, hoàn thành calibration, save/finalize score.
7. Hai session không thể silently overwrite cùng score nhờ `expectedVersion`.
8. Coordinator monitor, reopen và lock grading theo đúng điều kiện.

## 2. Actor, fixture và cấu hình

### Actor

| Mục đích | Tài khoản |
|---|---|
| Submission leader | `student72@seal.test` |
| Non-leader member | `student73@seal.test` |
| Other member | `student74@seal.test` |
| Judge Web | `judge1@seal.test` |
| Other judge | `judge2@seal.test` |
| Guest judge AI | `judge3@seal.test` |
| Disposable judge | `judge5@seal.test` |
| Mentor Web | `mentor1@seal.test` |
| Other-track mentor | `mentor2@seal.test` |
| Coordinator | `coordinator@seal.test` |

Mật khẩu seed: `Password@123`.

### Core fixture

| Resource | Giá trị |
|---|---|
| Event | SEAL Summer 2026 — `9d1822f7-ec66-52fe-8569-4faeb6b0a85b` |
| Round | Final Demo Round — `d7104abc-8192-5a20-bcd8-4b99748297bb` |
| Track | Web — `8039cc28-1b76-556f-8bc2-2e544416d4c8` |
| Team | Final Draft Crew — `18000000-0000-4000-8000-000000000203` |
| Submission | `18000000-0000-4000-8000-000000000401` |
| Required types | `REPOSITORY`, `DEMO` |
| Live calibration | `18000000-0000-4000-8000-000000000301` |
| Judge1 final assignment | `18000000-0000-4000-8000-000000000321` |

### Trạng thái sạch sau Flyway V24

V24 xóa hai link giả của Final Draft Crew. Trước khi test:

- submission status `DRAFT`;
- `submission_number=1`;
- không có `submission_attempts` cho submission này;
- thiếu `REPOSITORY` và `DEMO`;
- leader được edit nhưng chưa được finalize.

Nếu trạng thái khác, full reset database V1–V24 trước khi demo.

## 3. Hai profile integration

### Profile A — provider disabled/unconfigured

```env
SUBMISSION_LOCAL_FILE_ENABLED=false
SUBMISSION_GOOGLE_DRIVE_ENABLED=false
SUBMISSION_GITHUB_ENABLED=false
```

Mục tiêu: kiểm tra unavailable message và controlled error; không coi integration thật là PASS.

### Profile B — integration thật

```env
PROVIDER_CREDENTIAL_ENCRYPTION_KEY=<Base64-encoded-32-byte-key>
PROVIDER_OAUTH_COOKIE_SECURE=false

SUBMISSION_STORAGE_PROVIDER=AWS_S3
SUBMISSION_LOCAL_FILE_ENABLED=true
SUBMISSION_GOOGLE_DRIVE_ENABLED=true
SUBMISSION_GITHUB_ENABLED=true

AWS_REGION=<region>
AWS_S3_BUCKET=<bucket>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

GOOGLE_DRIVE_CLIENT_ID=<client-id>
GOOGLE_DRIVE_CLIENT_SECRET=<client-secret>
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:8080/api/v1/integrations/google-drive/callback
GOOGLE_DRIVE_PICKER_API_KEY=<picker-key>
GOOGLE_DRIVE_APP_ID=<numeric-app-id>

GITHUB_SUBMISSION_CLIENT_ID=<client-id>
GITHUB_SUBMISSION_CLIENT_SECRET=<client-secret>
GITHUB_SUBMISSION_REDIRECT_URI=http://localhost:8080/api/v1/integrations/github/callback
```

Không nhầm:

- `GITHUB_CLIENT_ID/SECRET`: social login.
- `GITHUB_SUBMISSION_*`: repository submission OAuth.
- `GITHUB_TOKEN`: optional server metadata fallback, không đại diện student.

## 4. Thứ tự bắt buộc

1. Requirements/permission baseline.
2. Test provider unavailable.
3. Add URL/local/Drive/GitHub evidence.
4. Finalize attempt #1.
5. Test immutable history/download.
6. Begin resubmit, sửa evidence, finalize attempt #2.
7. Chỉ sau đó coordinator mới lock submissions.
8. Judge queue/blind view.
9. Score draft/concurrency/finalize.
10. Coordinator progress/reopen/lock grading.

Nếu lock submission trước bước 6, resubmit phải bị chặn và không thể hoàn thành happy path.

### Quy ước endpoint và inventory mới

Mọi route viết rút gọn trong module này đều nằm dưới base path `/api/v1`. Các operation bổ sung sau baseline V19 phải có evidence riêng như sau; operation mentor còn lại được test ở Module 3.

| Method | Endpoint hiện tại |
|---|---|
| GET | `/api/v1/integrations/google-drive/status` |
| POST | `/api/v1/integrations/google-drive/connect` |
| GET | `/api/v1/integrations/google-drive/callback` |
| GET | `/api/v1/integrations/google-drive/picker-session` |
| DELETE | `/api/v1/integrations/google-drive/connection` |
| GET | `/api/v1/integrations/github/status` |
| POST | `/api/v1/integrations/github/connect` |
| GET | `/api/v1/integrations/github/callback` |
| GET | `/api/v1/integrations/github/repositories` |
| GET | `/api/v1/integrations/github/repositories/{owner}/{repository}/branches` |
| GET | `/api/v1/integrations/github/repositories/{owner}/{repository}/tags` |
| DELETE | `/api/v1/integrations/github/connection` |
| GET | `/api/v1/teams/{teamId}/rounds/{roundId}/submission-requirements` |
| POST | `/api/v1/teams/{teamId}/rounds/{roundId}/submission/google-drive` |
| POST | `/api/v1/teams/{teamId}/rounds/{roundId}/submission/github` |
| PATCH | `/api/v1/submission-links/{linkId}/metadata` |
| GET | `/api/v1/submissions/{submissionId}/attempts` |
| GET | `/api/v1/submissions/{submissionId}/attempts/evidence/{evidenceId}/download-url` |
| POST | `/api/v1/submissions/{submissionId}/resubmit` |

Route thứ 20 là `GET /api/v1/mentor/submissions`, đã có scenario W3-S11. Không gộp callback/status/list/import thành một evidence duy nhất.

## 5. Scenario overview

| ID | Scenario | Actor | Mode |
|---|---|---|---|
| W4-S01 | Requirements và initial capabilities | student72/student73 | UI + API |
| W4-S02 | Save draft/note | student72 | UI |
| W4-S03 | External URL evidence | student72 | UI + API |
| W4-S04 | Evidence metadata | student72 | UI + API |
| W4-S05 | Local upload unavailable | student72 | API |
| W4-S06 | Local S3 upload/download | student72 | UI + Integration |
| W4-S07 | Drive unavailable | student72 | API |
| W4-S08 | Drive OAuth/Picker/import | student72 | UI + Integration |
| W4-S09 | GitHub unavailable | student72 | API |
| W4-S10 | GitHub OAuth/repo/ref snapshot | student72 | UI + Integration |
| W4-S11 | Provider disconnect/reconnect | student72 | UI + API |
| W4-S12 | Finalize attempt #1 | student72 | UI + API |
| W4-S13 | Attempt history/evidence access | multiple roles | UI + API + SQL |
| W4-S14 | Resubmit/finalize attempt #2 | student72 | UI + API |
| W4-S15 | Coordinator list/detail/lock submissions | coordinator | UI + API |
| W4-S16 | Mentor list/detail/feedback | mentor1/mentor2 | UI + API |
| W4-S17 | Judge queues/blind view | judge1/judge2 | UI + API |
| W4-S18 | Draft/final scores | judge1 | UI + API |
| W4-S19 | Optimistic score concurrency | judge1 | Two sessions |
| W4-S20 | Calibration | judge1/coordinator | UI + API |
| W4-S21 | Grading progress/reopen/lock | coordinator | UI + API |

## W4-S01 — Authoritative requirements và capability

1. Login student72.
2. Mở Final Draft Crew → submissions → Final Demo Round.
3. Ghi request:

```http
GET /api/v1/teams/18000000-0000-4000-8000-000000000203/rounds/d7104abc-8192-5a20-bcd8-4b99748297bb/submission-requirements
```

4. Đối chiếu response với UI Requirement panel.

### Expected leader

- Đúng event/track/team/round và submission deadline.
- `roundStatus=OPEN`, chưa submission-locked.
- `canView=true`, `canEdit=true`, `canSubmit=false`.
- `blockedReason=MISSING_REQUIRED_TYPES`.
- `missingRequiredTypes` chứa `REPOSITORY`, `DEMO`.
- `requirements` chứa đủ REPOSITORY/DEMO/SLIDE/REPORT/VIDEO/OTHER.
- REPOSITORY cho phép URL, LOCAL_FILE, GOOGLE_DRIVE, GITHUB.
- Loại còn lại không cho GITHUB.
- Upload policy trả max bytes, max files, MIME và extension.
- Provider availability trả URL luôn available và từng provider kèm reason.
- **Submit Final** disabled.

### Expected non-leader

Login student73 và mở cùng route:

- có thể view theo membership;
- `canEdit=false`, `canSubmit=false`;
- blocked reason `NOT_TEAM_LEADER`.

### Negative

- Non-member/other team.
- Team-round thuộc event khác.
- Unknown UUID.
- Team không track/registration chưa APPROVED/eliminated.

## W4-S02 — Save draft và note

1. student72 sửa note.
2. Click **Save Draft**.
3. Refresh trang.

### Expected

- Vẫn một row `(team_id, round_id)`.
- Status vẫn DRAFT; number vẫn 1.
- Note/update timestamp thay đổi.
- Không tạo submission attempt.

### Negative

- Gửi status khác DRAFT qua draft endpoint.
- Non-leader save.
- Round không OPEN, locked hoặc deadline đã qua.
- Submit request có team/round mismatch.

## W4-S03 — External URL evidence

1. Add Attachment → URL.
2. Chọn type `DEMO`.
3. Nhập HTTPS URL hợp lệ, label, primary/display order.
4. Save và refresh requirements.

### Expected

- Link provider `EXTERNAL_URL`.
- DEMO chuyển satisfied; REPOSITORY vẫn missing.
- `canEdit=true`, `canSubmit=false`.

### Negative

- Blank/invalid URL.
- `javascript:`, `file:` hoặc scheme không HTTP(S).
- Unsupported type/duplicate state theo rule.
- Link/submission mismatch.
- Add/edit/delete finalized submission mà chưa Resubmit.

## W4-S04 — Update evidence metadata

1. Gọi update link bình thường nếu cần đổi URL/source fields hợp lệ.
2. Gọi API mới:

```http
PATCH /api/v1/submission-links/{linkId}/metadata
```

3. Đổi label, primary và display order.
4. Refresh UI.

### Expected

- Presentation metadata thay đổi.
- Không thay provider identity/checksum/commit SHA/object key qua metadata endpoint.
- Audit phản ánh mutation nếu current service ghi audit cho action này.

### Negative

Wrong owner, unknown link, negative order, finalized current submission và attempt evidence ID.

## W4-S05 — Local upload khi provider disabled

Profile A:

1. Requirements phải trả LOCAL_FILE unavailable + actionable message.
2. UI disable/hide local selection phù hợp.
3. Gọi multipart upload trực tiếp.

### Expected

Controlled 409/503; không tạo `submission_links`; không có object key/file dở dang.

## W4-S06 — Local S3 upload và download

Profile B:

1. Add Attachment → Local file.
2. Chọn submission type trước upload.
3. Upload file hợp lệ dưới 25 MB hoặc limit do server trả.
4. Save và refresh.
5. Gọi `/submission-links/{linkId}/download-url` và mở file.

### Expected

- Provider AWS_S3.
- objectKey, originalFileName, contentType, fileSizeBytes đúng.
- Download URL short-lived; bucket/object không cần public.
- `submitNow=true` bị từ chối với message dùng finalize endpoint riêng.

### Negative

- Empty file.
- Executable/unsupported MIME hoặc extension.
- MIME-extension mismatch.
- Oversize: 413.
- File count > configured maximum.
- Wrong team/round/owner.
- Storage credentials/bucket unavailable: controlled 503 và cleanup object/link.

## W4-S07 — Google Drive unavailable

Profile A hoặc thiếu một credential:

1. Requirements trả GOOGLE_DRIVE unavailable reason cụ thể.
2. `GET /integrations/google-drive/status` vẫn không lộ token.
3. `POST /integrations/google-drive/connect` và Picker/import trực tiếp.

### Expected

Không tạo connection/link; lỗi cấu hình 400/409/503 có message hành động được; không 500.

## W4-S08 — Google Drive OAuth, Picker và snapshot import

Profile B:

1. Add Attachment → Google Drive.
2. Click **Connect Google Drive**.
3. Consent bằng Drive test account.
4. Callback trở về đúng submission return path.
5. UI hiển thị connected account email.
6. Click **Choose from Google Drive**.
7. Chọn file do Picker trả; chọn type REPORT/SLIDE/DEMO phù hợp.
8. Click **Import this file**.
9. Refresh draft và requirements.

### Expected

- Callback 302; state sống ngắn, gắn browser nonce/cookie.
- Status response không chứa access/refresh token.
- Picker session chỉ cấp browser token ngắn hạn cần thiết.
- File được kiểm tra size/MIME/extension.
- File bytes được copy vào internal object storage.
- Link lưu providerResourceId, checksum khi có, providerModifiedAt, original metadata và objectKey.
- UI báo “imported and snapshotted”.

### Security/negative

- Callback thiếu/sai/expired state.
- Callback trong browser khác không có matching cookie.
- User cancel.
- Return path là external URL hoặc protocol-relative URL: phải bị sanitize về safe local path.
- File không được Picker cấp quyền/đã xóa.
- File oversize/unsupported.
- Drive 429 hoặc storage/provider 503.
- Import bằng user khác với connection owner.

## W4-S09 — GitHub unavailable

Profile A/thiếu `GITHUB_SUBMISSION_*`:

1. Requirements trả GITHUB unavailable reason.
2. Connect/list repository trực tiếp.
3. Xác nhận system không dùng social-login token hoặc server `GITHUB_TOKEN` thay student.

Expected: controlled configuration error, không tạo fake GitHub link.

## W4-S10 — GitHub OAuth và immutable repository snapshot

Profile B:

1. Add Attachment → GitHub.
2. Public repo flow: không chọn **Include private repositories**.
3. Click **Connect GitHub** và hoàn tất consent.
4. Callback quay về submission route; status connected.
5. Load repositories.
6. Chọn repository không archived/disabled.
7. Chọn reference type BRANCH; chọn branch.
8. Click **Use this repository**.
9. Lặp trên disposable draft/reference cho TAG hoặc COMMIT nếu cần coverage.

### Expected

- Provider `GITHUB`, type `REPOSITORY`.
- Link lưu owner, repository, selectedReference, referenceType.
- Backend resolve ref thành immutable commit SHA và commit URL.
- Lưu visibility, primary language, default branch, last push, committedAt, sync time.
- `providerResourceId=owner/repository` và `providerChecksum=commitSha`.
- Sau khi DEMO + REPOSITORY đủ, requirements `canSubmit=true`, missing list rỗng.

### Private repository flow

Chỉ chạy nếu acceptance cần private repo:

1. Tick Include private repositories.
2. UI phải cảnh báo GitHub OAuth App cần broad `repo` scope.
3. Sau consent, status báo private access granted.
4. Private repo chỉ xuất hiện khi scope thực sự được cấp.

### Negative/security

- Inaccessible repo/branch/tag/commit.
- Archived hoặc disabled repository không selectable.
- Callback state/cookie sai hoặc expired.
- Repo owner path encoding/unknown repo.
- Disconnected/revoked token.
- 429 rate limit; 503 provider.
- GITHUB source cho non-REPOSITORY type phải bị từ chối.

## W4-S11 — Disconnect và reconnect providers

1. Disconnect Google Drive.
2. Disconnect GitHub.
3. Check status và database connection row.
4. Mở lại current evidence.
5. Thử thêm provider evidence mới.
6. Reconnect một provider.

### Expected

- `connected=false`, `disconnected_at` được set.
- API/audit không trả encrypted token.
- Existing draft/attempt evidence không bị xóa.
- Mutation provider mới yêu cầu reconnect.
- Disconnect lặp idempotent/controlled.
- Reconnect update cùng unique `(user, provider)` row, không duplicate.

## W4-S12 — Finalize attempt #1

1. Đảm bảo DEMO và REPOSITORY satisfied.
2. Review note/evidence/checklist.
3. Click **Submit Final**.
4. Refresh participant list, requirements và coordinator detail.
5. Gọi submit endpoint lần hai.

### Expected

- Current submission `SUBMITTED`.
- `submission_number=1`.
- `submitted_at` mới.
- Exactly one `submission_attempts` number 1.
- Attempt copy note/status/submitted time và mọi current evidence.
- Audit `SUBMISSION_SUBMITTED`, notification được tạo.
- Repeated submit không duplicate attempt/link; trả idempotent response.
- Requirements blocked `SUBMISSION_RESUBMISSION_REQUIRED`; edit/submit false.

### Negative

Finalize khi thiếu required type, non-leader, after deadline, locked round, wrong state và team không eligible.

## W4-S13 — Attempt history và evidence access

1. Mở Submission History.
2. Gọi `GET /submissions/{id}/attempts`.
3. Xác nhận newest-first và attempt #1.
4. Với AWS_S3 evidence, gọi attempt download-url.
5. Với GitHub, mở immutable commit URL.
6. Với external URL/Drive, kiểm tra safe HTTP(S) opening theo storage behavior.

### Authorization

- Team member/leader: xem own submission.
- Coordinator: xem admin detail/history.
- Assigned judge/mentor: chỉ khi workflow/assignment cho phép.
- Unrelated student/judge/mentor: 403/404.

### Negative

- Evidence ID thuộc attempt/submission khác.
- Non-file evidence gọi S3 attempt download endpoint: 400.
- Missing object key.
- Expired signed URL.
- Unsafe URL scheme.

### Append-only SQL check

Chỉ local database:

```sql
BEGIN;
UPDATE submission_attempts
SET note='must fail'
WHERE submission_id='18000000-0000-4000-8000-000000000401';
ROLLBACK;
```

Lặp với DELETE attempt và UPDATE/DELETE `submission_attempt_links`. V20 trigger phải từ chối tất cả.

## W4-S14 — Begin resubmit và finalize attempt #2

1. Khi round còn OPEN/chưa deadline/lock, click **Resubmit**.
2. Refresh requirements.
3. Sửa note và ít nhất một current evidence/metadata.
4. Xác nhận attempt #1 không đổi.
5. Finalize lại.

### Expected

- Begin resubmit chuyển current submission về DRAFT.
- `submission_number` tăng 1 → 2.
- Attempt #1 tồn tại nguyên vẹn.
- Finalize tạo exactly one attempt #2.
- Attempt #2 chứa evidence mới; attempt #1 không retroactively thay đổi.
- Audit có RESUBMITTED và SUBMITTED tương ứng.

### Negative/concurrency

- Resubmit current DRAFT trả idempotent current draft hoặc controlled response; không tăng number lần hai.
- DQ/non-scorable terminal status.
- Round locked/deadline passed/not OPEN.
- Hai Begin Resubmit đồng thời: number chỉ tăng một lần.
- Hai Finalize đồng thời: một attempt number duy nhất.

## W4-S15 — Coordinator list/detail và lock submissions

Chỉ chạy sau W4-S14.

1. Coordinator mở `/coordinator/submissions`.
2. Filter Summer/Final/Web/SUBMITTED.
3. Mở Final Draft Crew detail.
4. Đối chiếu current submission, evidence, attempt #1/#2.
5. Gọi `POST /rounds/{roundId}/lock-submissions` khi fixture chain đã sẵn sàng.
6. Refresh round/submission requirements.

### Expected

- Student không gọi coordinator list/detail.
- Sau lock, `submission_locked_at` được set; edit/resubmit/finalize bị chặn.
- Submitted attempts vẫn xem được.
- Lock lần hai controlled conflict/idempotent.

### Negative

Invalid event/round/track filter, unknown submission, wrong role và lock không đúng state/readiness.

## W4-S16 — Mentor list/detail và feedback

1. mentor1 mở `/mentor/submissions`.
2. API mới `GET /api/v1/mentor/submissions` phải trả assigned-track submissions.
3. Draft không xuất hiện; SUBMITTED/LATE/DISQUALIFIED có thể xuất hiện.
4. Mở assigned detail/history theo policy.
5. Create draft feedback, edit và publish dedicated row.
6. Participant chỉ xem published/team-visible feedback.
7. mentor2 gọi Web submission: 403.

Negative: mismatched team/submission/round, blank feedback, edit/delete published, publish twice và wrong actor.

## W4-S17 — Judge queues, aliases và blind view

1. judge1 mở Dashboard → Assigned Submissions.
2. Filter Final Demo Round/Web/status.
3. Mở Final Draft Crew submission.
4. Cover hai route families:
   - `/judge/assignments`, `/judge/submissions`, `/judge/rounds/{roundId}/submissions`;
   - `/judges/me/assignments`, `/judges/me/submissions`, `/judges/me/rounds/{roundId}/submissions`, detail/summary.
5. judge2 gọi judge1-only resource.

### Expected

- judge1 chỉ thấy assigned scope.
- Blind view không lộ restricted team identity.
- judge2 nhận 403/404 không leakage.
- Judge chỉ chấm scorable submitted/late evidence sau submission lock và calibration readiness.

## W4-S18 — Save draft và finalize score sheet

1. judge1 mở score page.
2. Xác nhận đúng active criteria applicable to round.
3. Nhập value trong range và comment.
4. Save draft; refresh.
5. Sửa một value; Save lại.
6. Hoàn thiện mọi criterion và Finalize/Confirm.

### Expected

- Save lại update row, không duplicate `(submission, judge, criterion)`.
- Draft có `isDraft=true`/chưa confirmed theo response model.
- Finalize tăng progress đúng một lần.
- Final scores immutable trừ coordinator reopen hợp lệ.

### Negative

Score < 0/> max, NaN, missing/duplicate/foreign criterion, unassigned judge, incomplete finalize, finalize twice và edit locked.

## W4-S19 — Optimistic score version với hai session

V23 thêm `scores.version`; frontend gửi `expectedVersion`.

1. Trước khi finalize, mở cùng score sheet ở Session A và B.
2. Ghi version hiện tại của từng criterion.
3. A sửa criterion X và Save.
4. B không refresh, sửa cùng criterion X và Save với expectedVersion cũ.
5. Refresh B và thử lại.

### Expected

- A: 200, version tăng.
- B stale: 409 `SCORE_VERSION_CONFLICT`.
- Message yêu cầu refresh.
- Value của A không bị ghi đè.
- Sau refresh, B dùng version mới và save được nếu sheet chưa locked.

### Evidence

Payload A/B, response 200/409, version/value trong DB trước/sau và UI sau refresh.

## W4-S20 — Calibration

1. judge1 mở Calibration Tasks.
2. Mở live calibration `18000000-0000-4000-8000-000000000301`.
3. Kiểm tra sample submission, criteria và benchmark visibility.
4. V24 đã thêm judge1 calibration scores cần thiết; xác nhận account không bị chặn khỏi normal grading do thiếu mandatory calibration.
5. Dùng judge5 hoặc dedicated uns cored actor cho submit-calibration happy path nếu judge1 row đã tồn tại.
6. Coordinator tạo/edit disposable calibration trước khi có scores.
7. Xem score sheet/distribution.
8. Publish distribution trên closed/unpublished fixture.

### Negative

Outside window, unassigned/ineligible judge, missing/duplicate/foreign criterion, out-of-range, duplicate submit, incomplete benchmark, publish early/twice và wrong role.

## W4-S21 — Grading progress, reopen và lock grading

1. Coordinator mở Grading Progress → event → round.
2. Kiểm tra assigned/submitted/confirmed/locked counts.
3. Mở dedicated score sheet.
4. Reopen qua:

```http
POST /api/v1/rounds/{roundId}/submissions/{submissionId}/judges/{judgeId}/scores/reopen
```

5. Nhập reason; xác nhận judge sửa được sau reopen.
6. Judge finalize lại.
7. Chạy grading-status endpoints.
8. Chỉ khi mọi required sheet complete, lock grading.

### Expected

- Reopen có audit actor/reason và chỉ trước ranking/publication boundary.
- Lock incomplete bị chặn.
- Lock success set `grading_locked_at`; round chuyển `RESULTS_READY` theo flow hiện tại.
- Lock twice và edit locked score bị từ chối.

## 6. Database consistency

```sql
SELECT team_id, round_id, count(*)
FROM submissions
GROUP BY team_id, round_id
HAVING count(*) > 1;

SELECT submission_id, attempt_number, count(*)
FROM submission_attempts
GROUP BY submission_id, attempt_number
HAVING count(*) > 1;

SELECT submission_id, judge_id, event_criteria_id, count(*)
FROM scores
GROUP BY submission_id, judge_id, event_criteria_id
HAVING count(*) > 1;

SELECT user_id, provider, count(*)
FROM provider_oauth_connections
GROUP BY user_id, provider
HAVING count(*) > 1;
```

Tất cả query phải trả 0 row.

Attempt comparison:

```sql
SELECT a.attempt_number, a.status, a.note,
       al.link_type, al.storage_provider,
       al.provider_resource_id, al.provider_checksum,
       al.provider_modified_at
FROM submission_attempts a
LEFT JOIN submission_attempt_links al ON al.attempt_id=a.id
WHERE a.submission_id='18000000-0000-4000-8000-000000000401'
ORDER BY a.attempt_number, al.display_order, al.created_at;
```

## 7. Checkpoint Module 4

- [ ] Initial requirement thiếu REPOSITORY/DEMO đúng V24.
- [ ] Non-leader capability bị chặn.
- [ ] Provider disabled trả actionable message, không fake success.
- [ ] Local file/Drive/GitHub happy path có evidence thật khi Profile B.
- [ ] OAuth state/cookie/return-path/privacy negative cases có evidence.
- [ ] GitHub ref lưu commit SHA bất biến.
- [ ] Attempt #1/#2 append-only và không duplicate.
- [ ] Resubmit chạy trước submission lock.
- [ ] Mentor/judge scope và blind view đúng.
- [ ] Stale score version trả 409, không lost update.
- [ ] Calibration, reopen và grading lock đúng thứ tự.

## 8. Cleanup/reset

- Disconnect provider test account nếu không dùng tiếp; không xóa attempt/evidence history.
- Chỉ remove judge5/mentor3 dependency-free assignment sau evidence.
- Không dùng SQL để “undo” attempt/score lock.
- Để replay trọn module, full reset database V1–V24 và chạy lại provider OAuth.