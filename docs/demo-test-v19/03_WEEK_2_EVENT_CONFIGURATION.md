# Module 2 — Event và Competition Configuration

> Baseline: SEAL V24.  
> Mục tiêu: coordinator cấu hình một cuộc thi từ draft tới trạng thái sẵn sàng vận hành mà không phá dữ liệu demo lõi.

## 1. Chuẩn bị

### Actor và fixture

| Mục đích | Actor/fixture | Quy tắc |
|---|---|---|
| Coordinator chính | `coordinator@seal.test` | cấu hình và mutation disposable |
| Coordinator phụ | `coordinator2@seal.test` | cancel/delete event disposable |
| Main live event | `SEAL Summer 2026` | không xóa |
| Historical event | `SEAL Spring 2025` | read-only |
| Draft config | `SEAL Fall 2026` | chỉ dùng children disposable |
| Archived snapshot | `SEAL Fall 2024 Archive` | read-only |
| Delete target | `SEAL Fall 2027 (Delete Me)` | xóa cuối module |
| Cancel target | `SEAL Spring 2027 (Cancel Me)` | cancel cuối module |
| Track target | `Throwaway Track` | update/delete |
| Criterion target | `Draft Custom Criterion` | update/delete |
| Template target | `Deprecated Sample Criterion` | activate/deactivate/delete |
| Prize target | `Consolation Prize (Disposable)` | update/delete sau evidence |
| Rule target | V18 disposable WILDCARD | update/delete |
| Round target | `Expired Open Round` | deadline transition |

Mật khẩu: `Password@123`.

### Nguyên tắc

- Dùng một event mới có tên chứa `Disposable` cho create wizard.
- Không delete Summer 2026, Spring 2025 hoặc event có team/submission.
- Mutation phải có audit; assignment/announcement có notification khi flow yêu cầu.
- Date phải giữ đúng thứ tự parent-child.

## 2. Danh sách scenario

| ID | Scenario | Mode |
|---|---|---|
| W2-S01 | Public discovery/detail | UI + API |
| W2-S02 | Create event wizard | UI |
| W2-S03 | Event update/lifecycle/cancel | UI + API |
| W2-S04 | Track CRUD/capacity | UI + API |
| W2-S05 | Scoring criteria template | UI + API |
| W2-S06 | Event/round criteria | UI + API |
| W2-S07 | Round CRUD/deadline transition | UI + API + Scheduler |
| W2-S08 | Advance rules | UI + API |
| W2-S09 | Mentor/judge assignment | UI + API |
| W2-S10 | Prize | UI + API |
| W2-S11 | Announcement lifecycle | UI + API |
| W2-S12 | Safe event delete | UI + API |

## W2-S01 — Public discovery và event detail

1. Logout; mở `/events` và `/explore`.
2. Filter/browse public events.
3. Mở Summer 2026; kiểm tra description, status, registration/competition window, tracks, rounds và awards.
4. Mở Spring 2025; kiểm tra published historical data.
5. Mở Fall 2024 Archive; xác nhận ARCHIVED query được nhưng Guest không mutation.

### Negative

- Unknown event ID: 404.
- Invalid season/status: 400.
- Coordinator mutation endpoint không token: 401.
- Public detail không lộ unpublished ranking/private submission.

## W2-S02 — Create draft event qua wizard

1. Coordinator mở `/coordinator/events/create`.
2. Event info:
   - unique name/slug/season/year;
   - status `DRAFT`;
   - registration open < close;
   - competition start < end;
   - description.
3. Thêm ít nhất hai tracks:
   - unique name/display order;
   - required link types;
   - min 3, max 5;
   - max teams.
4. Thêm criteria template và một custom event criterion.
5. Thêm rounds:
   - unique order;
   - start/end;
   - submission deadline;
   - judging deadline;
   - chỉ round cuối `isFinal=true`.
6. Assign mentor theo track và judge theo round/optional track.
7. Thêm prize unique scope/rank.
8. Review và submit.

### Expected

Event và toàn bộ children persist; detail/edit page tải đúng sau refresh; không có half-created child nếu wizard thất bại.

### Negative

- Duplicate season-year/slug: 409.
- Date đảo hoặc child outside parent window: 400.
- Track min > max, limit ≤ 0, duplicate name/order: 400/409.
- Round judging trước submission hoặc deadline sau end: 400.
- Duplicate prize rank trong cùng scope: 409.

## W2-S03 — Event update, transition và cancel

1. Mở `SEAL Spring 2027 (Cancel Me)`.
2. Update description/date hợp lệ; Save và refresh.
3. Gọi forward lifecycle transition được cho phép.
4. Ghi previous/new status và timestamp.
5. Cuối scenario, cancel event.

### Negative

- Skip transition bị cấm hoặc terminal → earlier state.
- Duplicate season/year.
- Student/Judge mutation: 403.
- Cancel lần hai: 409.

### Chú ý kiểm thử trạng thái

Source hiện vẫn có semantics ARCHIVED khá rộng. Ghi defect nếu UI/API cho archive từ state không phù hợp với SRS thay vì tự sửa dữ liệu demo.

## W2-S04 — Track CRUD và capacity

1. `SEAL Fall 2026` → Edit → Tracks.
2. Create một track disposable với required `REPOSITORY` + `DEMO`, min 3/max 5.
3. Update `Throwaway Track`.
4. Assign/remove mentor3 trên disposable assignment nếu chưa dùng ở Module 3.
5. Delete Throwaway Track sau khi đủ evidence.

### Negative

- Event/track mismatch.
- Invalid min/max/capacity.
- Duplicate track/mentor assignment.
- Assign non-mentor.
- Delete track có team/assignment/dependency.
- Wrong role.

## W2-S05 — Scoring criteria templates

1. Mở Criteria.
2. Create disposable template gồm name, category, max score, default weight, technical/default/active flags, rubric và description.
3. Update, deactivate và activate.
4. Với `Deprecated Sample Criterion`: activate → deactivate → delete đúng thứ tự.

### Negative

Blank/duplicate name, max score ≤ 0, negative weight, invalid category, delete referenced template và wrong role.

## W2-S06 — Event criteria và round scope

1. `SEAL Fall 2026` → event criteria.
2. Add template-backed criterion.
3. Override description/rubric/weight/max score nếu cần.
4. Add custom event-only criterion.
5. Scope một criterion vào selected rounds.
6. Mở `/coordinator/rounds/{roundId}/criteria` và xác nhận chỉ criteria applicable/active.
7. Update/delete `Draft Custom Criterion`.

### Negative

- Template hoặc round thuộc event khác.
- Duplicate template use.
- Invalid override/weight/max score.
- Delete criterion đã có score/dependency.

## W2-S07 — Round CRUD và scheduler transition

### CRUD

1. Tạo upcoming round disposable trong Fall 2026.
2. Sửa name/instruction/dates khi chưa locked.
3. Delete khi chưa có submission/score.

### Deadline transition

1. Mở `Expired Open Round` ID `18000000-0000-4000-8000-000000000601`.
2. Xác nhận ban đầu OPEN nhưng deadline đã qua.
3. Chờ/invoke local deadline scheduler.
4. Refresh trạng thái và lock timestamps.

### Expected

Scheduler chỉ transition fixture hết hạn, không đổi live Final Demo Round. Re-run không tạo transition/audit trùng bất hợp lý.

### Negative

Open trước competition, close twice, edit/delete locked round, delete round có submission/score, event mismatch và wrong role.

## W2-S08 — Advance-rule configuration

1. Mở round advancement/advance-rules.
2. Create rule cho `TOP_N`, `TOP_PERCENT`, `MIN_SCORE`, `WILDCARD` theo supported scope.
3. Update disposable WILDCARD.
4. Chạy preview/suggestions nhưng chưa confirm.
5. Delete disposable rule; giữ real TOP_N.

### Negative

Value ≤ 0, percentage > 100, duplicate priority/scope, track ngoài event, preview khi chưa có ranking và edit sau confirm.

## W2-S09 — Mentor và judge assignments

1. Assign active mentor vào track; mở mentor dashboard để xác nhận scope.
2. Assign active judge vào round + optional track; mở judge queue.
3. Dùng judge5 mobile assignment làm remove target sau khi đã chụp queue evidence.
4. Dùng mentor3 assignment làm remove target sau mentor evidence.

### Negative

- Duplicate assignment.
- Expired judge4.
- User wrong role.
- Round và track thuộc event khác.
- Remove assignment đang sở hữu score/locked obligation.

## W2-S10 — Prize configuration

1. Coordinator mở Awards/Prize setup.
2. Create unique overall hoặc track prize: rank, title, value, currency, sponsor, description.
3. Update `Consolation Prize (Disposable)`.
4. Chỉ delete sau khi Module 5 đã dùng negative award evidence.

### Negative

Duplicate event/track/rank, negative value, track khác event, delete awarded prize và wrong role.

## W2-S11 — Announcement lifecycle

1. Mở Announcement và chọn Summer 2026.
2. Create draft với title/content/target scope/roles/tracks/delivery switches.
3. Edit draft.
4. Schedule tương lai và kiểm tra SCHEDULED.
5. Dùng draft khác cho Send now/Publish.
6. Pin/unpin/mark-result/unpublish theo state được phép.
7. Delete/cancel chỉ dedicated draft/scheduled fixture.

### Negative

Blank title/content, past schedule, target khác event, publish twice, forbidden edit/delete terminal row và wrong role.

## W2-S12 — Delete event an toàn

1. Login `coordinator2@seal.test`.
2. Mở `SEAL Fall 2027 (Delete Me)` ID `18000000-0000-4000-8000-000000000701`.
3. Xác nhận DRAFT và không có team/submission dependency.
4. Delete; refresh list và gọi detail ID.

### Expected

Delete thành công, detail trả 404. Thử delete Summer 2026 phải conflict và không cascade data.

## 3. Checkpoint Module 2

- [ ] Public event data đúng và publication-safe.
- [ ] Event wizard persist đầy đủ children.
- [ ] Validation date/capacity/unique được chứng minh.
- [ ] Track/criteria/round/rule CRUD chỉ dùng disposable rows.
- [ ] Scheduler transition idempotent.
- [ ] Judge/mentor assignment đúng scope.
- [ ] Prize/announcement lifecycle đúng.
- [ ] Delete/cancel không làm hỏng core event.

## 4. Cleanup

Thứ tự: announcement draft → dependency-free assignments → disposable rule/criterion/track → cancel event → delete event. Không xóa Summer 2026, Spring 2025 hoặc archive snapshot.
