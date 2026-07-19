# Module 5 — Ranking, kết quả, advancement, DQ, giải thưởng và exports (V24)

## 1. Mục tiêu

Module này biến score đã khóa ở Module 4 thành kết quả có thể kiểm chứng: tính ranking, xem tie/variance, preview và confirm advancement, xử lý disqualification/appeal, publish kết quả, trao giải và xuất báo cáo bất đồng bộ.

Đây là bản viết lại cho source hiện tại tới Flyway **V24**. Không dùng số operation `300` của V19 làm baseline; inventory hiện tại là **320 OpenAPI operations / 272 paths**.

## 2. Điều kiện bắt buộc và thứ tự an toàn

1. Chạy Module 4 trước; round dùng để calculate phải hoàn tất grading và được lock.
2. Dùng `SEAL Spring 2025` để đọc dữ liệu lịch sử đã publish và tie fixture ổn định.
3. Dùng `SEAL Summer 2026` cho luồng thay đổi có kiểm soát.
4. Chạy các bài đọc, calculate, tie/variance và preview trước.
5. Chỉ sau khi đã chụp đủ evidence mới confirm advancement, DQ, publish và award.
6. Export và audit chạy cuối module.
7. Không sửa trực tiếp ranking/DQ/publication bằng SQL. Muốn chạy lại toàn bộ, reset database rồi để Flyway V1–V24 seed lại.

## 3. Tài khoản và fixture

Mật khẩu seed chung: `Password@123`.

| Actor/fixture | Mục đích |
|---|---|
| `coordinator@seal.test` | Calculate/publish, advancement, DQ, award, export |
| `student1@seal.test` | Kiểm tra kết quả/appeal thuộc team |
| Guest/Incognito | Kiểm tra public leaderboard và award |
| `admin@seal.test` | Đối chiếu audit khi cần |
| `SEAL Spring 2025` | Historical published ranking và tie fixture |
| `SEAL Summer 2026` | Live controlled workflow |
| `19000000-0000-4000-8000-000000000901` | Export `DONE` nhưng đã hết hạn |
| `18000000-0000-4000-8000-000000000804` | Prize disposable để clear/re-award |
| `18000000-0000-4000-8000-000000000805` | Advance rule `TOP_N` |
| `18000000-0000-4000-8000-000000000806` | Advance rule `WILDCARD` |

Nếu ID môi trường đã đổi, lấy ID thật từ response/list API và ghi vào evidence; không tự đoán UUID.

## 4. Evidence cần lưu cho mọi scenario

- Actor và thời điểm chạy.
- URL/màn hình hoặc method + endpoint.
- Request payload đã che token/secret.
- HTTP status, response body và business state trước/sau.
- Ảnh UI sau refresh.
- Audit ID hoặc notification/export job ID nếu được tạo.
- `PASS`, `FAIL`, `BLOCKED`, kèm defect ID.

## 5. Tổng quan scenario

| ID | Nghiệp vụ | Actor chính | Mức phá huỷ |
|---|---|---|---|
| W5-S01 | Ranking read và privacy | Coordinator/Guest | Không |
| W5-S02 | Calculate/recalculate | Coordinator | Thấp |
| W5-S03 | Tie và variance/RBL | Coordinator | Thấp |
| W5-S04 | Advancement preview/confirm | Coordinator | Cao khi confirm |
| W5-S05 | Disqualification | Coordinator | Cao |
| W5-S06 | Appeal uphold/overturn | Student/Coordinator | Cao |
| W5-S07 | Publish results | Coordinator | Cao, gần như terminal |
| W5-S08 | Prize/award | Coordinator/Guest | Cao |
| W5-S09 | Export happy paths | Coordinator | Thấp |
| W5-S10 | Failed/retry/expired/delete | Coordinator | Trung bình |
| W5-S11 | Export aliases và RBL privacy | Coordinator | Thấp |
| W5-S12 | Audit reconciliation | Admin/Coordinator | Không |

---

## W5-S01 — Đọc ranking và kiểm tra privacy

### Cách chạy

1. Login coordinator, mở ranking của Spring 2025 và Summer 2026.
2. Gọi các family phù hợp:
   - `GET /api/v1/rounds/{roundId}/rankings`
   - `GET /api/v1/events/{eventId}/rankings`
   - `GET /api/v1/tracks/{trackId}/rankings`
   - `GET /api/v1/rankings` với scope/filter hợp lệ
   - `GET /api/v1/rankings/teams/{teamId}` cho actor được phép.
3. Kiểm tra rank, total score, judge count, tie/advancement và scope round/track.
4. Logout hoặc dùng Incognito, gọi public leaderboard:
   - `GET /api/v1/public/events/{eventId}/leaderboard`
   - `GET /api/v1/public/events/{eventId}/tracks/{trackId}/leaderboard`.
5. So Spring đã publish với dữ liệu coordinator.
6. Thử đọc Summer chưa publish bằng Guest và student của team khác.

### Expected

- Ranking đúng event/round/track; không trộn submission giữa scope.
- Ranking Spring public khớp thứ tự đã publish.
- Summer chưa publish không lộ draft score, raw score sheet, judge comment hoặc private team data.
- Unknown hoặc mismatched IDs trả 4xx có kiểm soát, không trả danh sách sai scope.

## W5-S02 — Calculate và recalculate deterministic

### Cách chạy

1. Ghi lại grading state và số ranking row trước khi chạy.
2. Gọi `POST /api/v1/rounds/{roundId}/rankings/calculate` cho round đã grading lock.
3. Gọi lại bằng alias/current family `POST /api/v1/rankings/recalculate` với đúng scope.
4. Không đổi score, chạy lại cùng input lần thứ hai.
5. So từng submission: score, rank, tie metadata và calculated timestamp.

### Expected

- Chỉ score sheet hoàn tất được dùng; sheet thiếu/không hợp lệ không âm thầm làm sai trung bình.
- Công thức hiện tại tính trung bình weighted result theo judge; kết quả lặp lại phải deterministic.
- Không tạo duplicate cho cùng `(submission, round)`.
- DQ đứng sau/không được xếp như entry hợp lệ theo current rule.
- Round chưa lock grading, thiếu judge/criteria, wrong scope hoặc actor student/judge bị từ chối trước mutation.

### Query đối chiếu

```sql
SELECT submission_id, round_id, count(*)
FROM rankings
GROUP BY submission_id, round_id
HAVING count(*) > 1;
```

Expected: `0 rows`.

## W5-S03 — Tie, variance và RBL dataset

1. Mở Spring 2025 web ranking, tìm tie 8.30 đã seed.
2. Kiểm tra tie flag, cùng rank/tie group và cách manual resolution được lưu.
3. Mở variance dashboard của Summer; filter round, track và `judgeType=INTERNAL`, sau đó `GUEST`.
4. Thử `judgeType` không hợp lệ, round/track khác event và actor không quản lý event.
5. Tạo anonymized score/RBL export để dùng tiếp ở W5-S11.

Expected:

- Tie thực sự bằng điểm được đánh dấu, không tự resolve bằng tên/UUID một cách không công bố.
- Unresolved tie chặn bước publish/confirm nếu business rule yêu cầu.
- Variance phản ánh judge/submission đúng scope.
- RBL không chứa raw participant/team identity hoặc direct judge UUID; vẫn giữ đủ judge × criterion value để phân tích.

## W5-S04 — Advancement preview, suggestions và confirm

### API bắt buộc phải có evidence riêng

- `POST /api/v1/rounds/{roundId}/advance-rules/preview`
- `POST /api/v1/rounds/{roundId}/advancement-preview`
- `POST /api/v1/rounds/{roundId}/advancement/suggestions`
- `POST /api/v1/rounds/{roundId}/confirm-advancement`
- `POST /api/v1/rounds/{roundId}/advancement/confirm`

Ba route preview/suggestions cùng business family; hai route confirm là aliases. Mỗi OpenAPI operation vẫn cần evidence HTTP riêng, nhưng không được coi là năm tính năng độc lập.

### Cách chạy

1. Mở advance rules; kiểm tra priority/scope của `TOP_N`, `TOP_PERCENT`, `MIN_SCORE`, `WILDCARD` nếu có.
2. Preview bằng canonical route, chụp candidate list.
3. Gọi hai alias preview/suggestions và so kết quả.
4. Query trạng thái team trước/sau preview: không team nào được đổi.
5. Nếu dùng override, chọn đúng tie/exception và nhập reason có ý nghĩa.
6. Chỉ sau khi review, confirm bằng một route; route alias còn lại dùng làm negative `confirm twice`.
7. Login participant, đọc `GET /api/v1/teams/{teamId}/rounds/{roundId}/advancement-status` và kiểm tra notification.

### Expected

- Preview/suggestions read-only và deterministic.
- Confirm ghi advanced/eliminated state, timestamp, audit và notification đúng một lần.
- Blank override reason, no ranking, unresolved tie, wrong role, confirm twice hoặc đổi rule sau confirm bị chặn.
- Team/event/round scope không bị cross-tenant.

## W5-S05 — Disqualify submission/team

Chỉ dùng dedicated disposable submission ở trạng thái `SUBMITTED` hoặc `LATE`.

1. Coordinator gọi `POST /api/v1/disqualifications` với submission, reason bắt buộc và evidence URL hợp lệ nếu dùng.
2. Mở `GET /api/v1/disqualifications/{disqualificationId}`.
3. Gọi list theo event và active DQ theo team:
   - `GET /api/v1/events/{eventId}/disqualifications`
   - `GET /api/v1/teams/{teamId}/disqualifications/active`.
4. Recalculate ranking nếu current service yêu cầu.
5. Kiểm tra submission chuyển `DISQUALIFIED`, team bị loại theo flow, prize đã gán cho team bị clear nếu business rule áp dụng, audit và participant notification.

Negative:

- reason rỗng;
- evidence URL sai;
- DQ cùng submission lần hai;
- submission/team thuộc event khác;
- unknown ID;
- Student/Judge gọi mutation.

Không dùng Final Draft Crew nếu còn cần demo grading/attempt ở Module 4.

## W5-S06 — Appeal, uphold và overturn

### Appeal

1. Login participant sở hữu DQ fixture.
2. Gọi `PATCH /api/v1/disqualifications/{disqualificationId}/appeal` với note rõ ràng.
3. Refresh detail và list coordinator.
4. Appeal lần hai và appeal DQ của team khác.

Expected: appeal đầu chuyển `PENDING`; duplicate/cross-team bị 4xx/403–404; không lộ private reason/evidence cho người không thuộc scope.

### Uphold/overturn

1. Với fixture pending thứ nhất, resolve theo hành vi current UI/service dùng để uphold.
2. Với fixture pending thứ hai, gọi `POST /api/v1/disqualifications/{disqualificationId}/overturn` kèm reason.
3. Đọc lại active DQ, submission/team state và ranking.

Expected:

- Terminal decision không thể resolve lần hai.
- Overturn bỏ active DQ và phục hồi state hợp lệ; ranking chỉ trở lại sau calculate/recalculate theo flow.
- Audit và notification phân biệt uphold với overturn.

## W5-S07 — Publish results

Chạy scenario này sau tie/advancement/appeal và grading lock.

1. Coordinator kiểm tra ranking current, không unresolved tie/appeal, grading đã lock.
2. Nếu test round: `POST /api/v1/rounds/{roundId}/results/publish`.
3. Nếu test toàn event: `POST /api/v1/events/{eventId}/results/publish` khi tất cả scope cần thiết đã sẵn sàng.
4. Đọc authenticated results:
   - `GET /api/v1/rounds/{roundId}/results`
   - `GET /api/v1/events/{eventId}/results`.
5. Dùng Guest kiểm tra public leaderboard và participant kiểm tra result/score.
6. Gọi publish lần hai để kiểm tra idempotency/conflict theo thiết kế.

Expected:

- `resultPublishedAt` được ghi đúng scope một lần.
- Public ordering khớp snapshot kết quả đã publish.
- Không lộ draft judge comments, judge identity bị blind hoặc raw score sheet.
- Publish bị từ chối nếu grading chưa lock, ranking thiếu/stale, tie hoặc appeal còn blocking.

## W5-S08 — Prize và award

### Read/configuration

1. Coordinator list `GET /api/v1/prizes/events/{eventId}` và mở detail.
2. Chỉ tạo/sửa/xóa prize disposable nếu cần test CRUD; không xóa seeded prize có winner.

### Award flow

1. Gọi `POST /api/v1/events/{eventId}/prizes/assign-from-ranking` cho dedicated unawarded prize.
2. Kiểm tra winner team, rank, awarded time và notification.
3. Với prize disposable `...804`, gọi `POST /api/v1/prizes/{prizeId}/award` hoặc `PATCH /api/v1/prizes/{prizeId}/winner` với team hợp lệ và reason.
4. Clear bằng `POST /api/v1/prizes/{prizeId}/clear-award`, bắt buộc reason; re-award nếu cần trạng thái cuối đẹp cho demo.
5. Dùng Guest gọi `GET /api/v1/events/{eventId}/awards`.

Negative:

- team event/track khác;
- award trước khi result đủ điều kiện;
- rank không khớp;
- award lại prize đang có winner;
- clear prize chưa award hoặc reason rỗng;
- duplicate scoped rank;
- wrong role.

## W5-S09 — Export happy paths

1. Tạo từng loại được UI/source hiện tại hỗ trợ qua `POST /api/v1/exports`: ranking, score report, anonymized dataset, team list, calibration report và full event report.
2. Truyền event/round/track đúng scope; ghi lại export ID.
3. Poll `GET /api/v1/exports/{exportId}` hoặc list cho tới terminal.
4. Expected state: `QUEUED → PROCESSING → DONE`.
5. Đọc metadata và thử cả download metadata/file:
   - `GET /api/v1/exports/{exportId}/download`
   - `GET /api/v1/exports/{exportId}/download-file`.
6. Mở CSV/XLSX; đối chiếu filename, content type, header, số dòng và filter.
7. Tạo thêm bằng event shortcuts:
   - `POST /api/v1/events/{eventId}/exports/ranking`
   - `POST /api/v1/events/{eventId}/exports/scores`
   - `POST /api/v1/events/{eventId}/exports/team-list`.

Expected: shortcut tạo export job bình thường, không chạy một pipeline thiếu authorization/ownership khác.

## W5-S10 — FAILED, retry, expired và delete export

1. Mở seeded `FAILED` job, ghi error message đã sanitize.
2. Gọi `POST /api/v1/exports/{exportId}/retry`; poll trạng thái.
3. Gọi retry đồng thời/lặp lại và bảo đảm không tạo hai worker job cho cùng request.
4. Mở expired fixture `19000000-0000-4000-8000-000000000901`.
5. Detail/list phải còn đọc được; cả download URL và download file phải từ chối do expiry.
6. Xóa chỉ disposable failed/completed job qua `DELETE /api/v1/exports/{exportId}`.

Negative:

- retry `PROCESSING` hoặc `DONE` không retryable;
- delete `PROCESSING`;
- download `QUEUED`, `FAILED`, expired hoặc unknown;
- actor khác owner khi ownership áp dụng.

## W5-S11 — Aliases, async integrity và RBL privacy

### Ba API family cần đối chiếu

| Family | Routes chính |
|---|---|
| Export management | `/api/v1/exports`, detail, download, download-file, retry, delete |
| Event shortcuts | `/api/v1/events/{eventId}/exports/ranking`, `/scores`, `/team-list` |
| Job aliases | `/api/v1/export-jobs/{jobId}`, `/download`, `/download-file` |

Với cùng job, so ID, owner, status, expiry, filename/content type giữa `/exports` và `/export-jobs`. Authorization phải tương đương.

### RBL file checks

- Không có email, raw full name/team name hoặc direct judge UUID.
- Anonymized key ổn định trong cùng export policy nhưng không cho phép reverse từ file.
- Dữ liệu judge × criterion và score cần thiết vẫn đủ.
- CSV formula injection được neutralize với cell bắt đầu bằng `=`, `+`, `-`, `@` nếu dữ liệu người dùng đi vào file.
- Filename/header không chèn CRLF; file không chứa access token hoặc provider credential.

## W5-S12 — Audit reconciliation

1. Login coordinator/admin, mở audit logs.
2. Filter lần lượt ranking calculation, advancement confirmation, DQ/appeal/overturn, publish, award/clear và export.
3. Đối chiếu actor, target type/ID, before/after/context và timestamp với response đã lưu.
4. Thử alias audit list/detail nếu source cung cấp.
5. Kiểm tra request chứa evidence URL/export filters không làm lộ token hoặc signed download URL quá mức cần thiết.

Expected:

- Mỗi mutation nhạy cảm có audit append-only tương ứng.
- Không actor nào có thể sửa/xóa audit bằng API.
- Correlation giữa action, business record, notification và export job rõ ràng.

## 6. Negative/security matrix tối thiểu

| Boundary | Expected |
|---|---|
| Guest đọc unpublished result | 401/403/404 hoặc empty-safe theo contract |
| Student calculate/publish/DQ/award/export admin data | 403 |
| Coordinator quản lý event không thuộc scope | 403/404 |
| Round/track từ event khác | 4xx trước mutation |
| Duplicate calculate/retry/confirm/publish | Idempotent hoặc conflict có kiểm soát |
| Download expired/non-DONE | Không cấp URL/file |
| Public result response | Không raw score sheet/comment/private judge data |
| Export cell do user nhập | Không thực thi spreadsheet formula |

## 7. Completion checkpoint

- [ ] Ranking deterministic, scoped và publication-safe.
- [ ] Tie/variance và RBL privacy có evidence.
- [ ] Preview/suggestions không mutation; confirm advancement chỉ một lần.
- [ ] DQ/appeal/overturn đúng ownership và terminal states.
- [ ] Publish chỉ xảy ra sau grading/ranking/tie/appeal gates.
- [ ] Award from ranking, manual award và clear/re-award đã kiểm tra.
- [ ] Cả ba export API families, retry/expiry/download/ownership đều được chạy.
- [ ] Audit liên kết được toàn bộ mutation nhạy cảm.

## 8. Cleanup/reset

1. Xóa disposable export jobs và prize chưa phụ thuộc.
2. Nếu đã clear prize demo, re-award về trạng thái mong muốn.
3. Không cố undo advancement, DQ, appeal hoặc publication bằng SQL.
4. Muốn rehearsal từ đầu: drop/recreate local DB và chạy Flyway V1–V24.