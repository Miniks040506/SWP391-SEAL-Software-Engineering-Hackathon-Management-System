# Module 3 — Teams, Participation và Mentoring

> Baseline: SEAL V24.  
> Mục tiêu: demo đầy đủ bốn cách vào team, quyền leader/member, track registration review và mentor access boundary.

## 1. Chuẩn bị và thứ tự bắt buộc

Mật khẩu mọi seed account: `Password@123`.

| Actor | Mục đích |
|---|---|
| `student57@seal.test` | create/edit/delete empty team |
| `student58@seal.test` | invitation target |
| `student59@seal.test` | join code |
| `student60@seal.test` | join request |
| `student61@seal.test` | initial Sandbox leader |
| `student62@seal.test` | new leader after transfer |
| `student63@seal.test` | leave test |
| `student64@seal.test` | remove test |
| `student67@seal.test`–`student69@seal.test` | reject-registration team |
| `coordinator@seal.test` | review registration |
| `mentor1@seal.test` | assigned Web mentor |
| `mentor2@seal.test` | unassigned boundary |

Sandbox fixture:

- Team: `Sandbox Wolves`.
- Team ID: `18000000-0000-4000-8000-000000000201`.
- Join code: `SBOX26`.
- Initial state: FORMING, no track, four active members.

### Mutation order

1. student57 create/edit/delete team riêng.
2. student61 update/toggle code/invite student58.
3. student58 accept: member count 4 → 5.
4. leader remove student64: 5 → 4.
5. student63 leave: 4 → 3.
6. student59 join code: 3 → 4.
7. student61 transfer leader cho student62.
8. student62 register track.
9. Coordinator review dedicated seeded teams.

Không delete Sandbox Wolves.

## 2. Scenario overview

| ID | Scenario | Actor |
|---|---|---|
| W3-S01 | Create/edit/delete empty team | student57 |
| W3-S02 | Sandbox và join-code controls | student61/student59 |
| W3-S03 | Invitation accept/reject/cancel | leader/invitee |
| W3-S04 | Remove và leave | leader/member |
| W3-S05 | Join by code | student59 |
| W3-S06 | Transfer leadership | student61/student62 |
| W3-S07 | Forming-team join request | student60/leader |
| W3-S08 | Register track | student62 |
| W3-S09 | Coordinator approve/reject | coordinator |
| W3-S10 | Competition/private views | participant |
| W3-S11 | Mentor list/detail/feedback boundary | mentor1/mentor2 |

## W3-S01 — Create, edit và delete empty team

1. Login student57; mở `/participant/teams`.
2. Create team tên unique chứa `Disposable`.
3. Nhập project title và description.
4. Xác nhận detail:
   - student57 là LEADER;
   - status FORMING;
   - memberCount 1;
   - join code tồn tại.
5. Edit name/project/description; Save và refresh.
6. Trước khi invite/register, Delete Team với reason.

### Negative

- Blank/duplicate/overlong name.
- Create second active team khi rule cấm.
- Non-leader PATCH/DELETE.
- Delete registered/scored/core team.
- Delete thiếu reason nếu request yêu cầu.

### Expected

Empty team delete không ảnh hưởng user; audit có create/update/delete; team không còn trong list.

## W3-S02 — Join-code controls

1. student61 mở Sandbox Wolves.
2. Xác nhận four members, no track, FORMING, code SBOX26.
3. Update allowed team fields.
4. Toggle join code OFF.
5. Incognito student59 nhập SBOX26: phải thất bại.
6. Toggle ON.
7. student59 preview code.

### Expected

Preview trả team name/capacity cần thiết nhưng không lộ private member data. Wrong/disabled code trả controlled 400/404/409. Non-leader toggle trả 403.

## W3-S03 — Invitation lifecycle

### Accept

1. student61 chọn Invite Member.
2. Invite `student58@seal.test` với optional message.
3. Xác nhận một PENDING invitation.
4. student58 mở `/participant/invitations` và accept.
5. Refresh hai session.

Expected: invitation ACCEPTED; student58 có active membership; count 4 → 5; invitee notification/email theo cấu hình.

### Reject/cancel độc lập

- Reject fixture token: `token-pending-beta-reject`.
- Cancel fixture token: `token-pending-gamma-cancel`.
- Không reuse accepted invitation.

### Negative

- Invite existing member, full team, duplicate pending, inactive/non-student hoặc user đang ở active team khác.
- Non-leader invite/cancel.
- Accept/reject expired/cancelled/already responded token.
- Unrelated user mutate invitation ID/token.

## W3-S04 — Remove và leave

1. student61 remove student64; count 5 → 4.
2. Kiểm tra historical member row có `left_at` và reason.
3. student63 leave; count 4 → 3.
4. Refresh leader page.

### Negative

Remove leader, unknown/inactive member, non-leader remove, leader leave khi còn member và repeat remove/leave.

### Database consistency

```sql
SELECT t.member_count, count(tm.id) AS active_members
FROM teams t
LEFT JOIN team_member tm ON tm.team_id=t.id AND tm.left_at IS NULL
WHERE t.id='18000000-0000-4000-8000-000000000201'
GROUP BY t.member_count;
```

Hai giá trị phải bằng nhau sau mỗi mutation.

## W3-S05 — Join by code

1. student59 preview SBOX26.
2. Confirm join.
3. Xác nhận member row và count 3 → 4.

### Negative

Wrong/disabled code, already member, already in another active team, full/registered/non-forming team và inactive account.

## W3-S06 — Transfer leadership

1. student61 transfer leader cho active member student62.
2. Refresh cả hai session.
3. Xác nhận student62 LEADER, student61 MEMBER và `leader_id` đúng.
4. Old leader thử toggle/invite/register: 403.
5. New leader thực hiện một leader-only read/mutation hợp lệ.

### Negative

Transfer tới non-member/inactive member, invalid target hoặc repeat từ old leader.

## W3-S07 — Forming-team discovery và join request

1. student60 browse forming teams qua UI hoặc `GET /teams/forming`.
2. Chọn `Summer Formers` và gửi request với message.
3. Kiểm tra `/teams/join-requests/me`: PENDING.
4. Login team leader; mở Join Requests.
5. Accept dedicated request.
6. Dùng request khác để reject với reason.

### Expected

- Join request tái sử dụng `TeamInvitation` với `type=JOIN_REQUEST`.
- Accepted request tạo membership; rejected không tạo membership.
- Requester/leader nhận notification phù hợp.

### Negative

Duplicate pending, full/registered team, requester đã ở team khác, inactive user, non-leader response và terminal/expired token.

## W3-S08 — Track registration

1. Login new leader student62.
2. Sandbox → Track Registration.
3. Chọn Summer track có min/max chấp nhận count 4.
4. Confirm registration.

### Expected

- Registration status `PENDING_APPROVAL`.
- Không tự động APPROVED.
- Team status/state khớp response service hiện tại.
- Audit/notification được tạo khi thiết kế yêu cầu.

### Negative

Count dưới min/trên max, track full, ngoài registration window, track event khác, duplicate registration và non-leader.

## W3-S09 — Coordinator registration review

1. Coordinator mở Teams và filter PENDING_APPROVAL.
2. Approve `Approval Pending Crew` một lần.
3. Reject `Approval Reject Crew` với non-empty reason.
4. Kiểm tra team view, audit và notification.

### Negative

Review twice, reject rỗng, team không còn đủ member, inactive member, max approved capacity, track-event mismatch và wrong role.

### Ghi nhận state gap

Source hiện chưa có normal transition rõ ràng `REGISTERED → COMPETING` và `COMPLETE` ít được dùng. Nếu demo yêu cầu state đó nhưng UI/API không chuyển, ghi defect; không sửa trực tiếp database giữa test.

## W3-S10 — Competition và participant privacy

1. Participant mở `/events/{eventId}/competing` hoặc participant alias.
2. Kiểm tra eligible own team, current round, deadline, submission và advancement actions.
3. Mở own published scores/advancement.
4. Thay teamId sang team khác.

### Expected

Another team draft, unpublished scores/ranking và private member data không được trả. Eliminated/unapproved team không mutation protected resource.

## W3-S11 — Mentor submission list, team detail và feedback

1. Login mentor1; mở `/mentor/teams` và assigned Web team.
2. Kiểm tra roster, track, submission và progress.
3. Mở `/mentor/submissions`.
4. Xác nhận API mới `GET /api/v1/mentor/submissions` filter theo assignment.
5. Mentor chỉ thấy submission status `SUBMITTED`, `LATE`, `DISQUALIFIED`; DRAFT không lộ qua list.
6. Mở assigned submission detail.
7. Create draft feedback, edit và publish dedicated row.
8. Dùng V18 disposable draft làm delete target.
9. Login mentor2 và gọi cùng team/submission.

### Expected

mentor1 success; mentor2 403. Participant chỉ thấy published/team-visible feedback, không thấy draft.

### Negative

Mismatched team/submission/round, blank content, edit/delete published feedback, publish twice và student actor.

## 3. Checkpoint Module 3

- [ ] Create/delete team riêng không phá Sandbox.
- [ ] Invitation accept/reject/cancel dùng row độc lập.
- [ ] Join code và join request đều hoạt động.
- [ ] Member count/leader nhất quán sau refresh và SQL check.
- [ ] Track registration và coordinator review có audit/notification.
- [ ] Old leader mất quyền ngay.
- [ ] Mentor list/detail đúng assignment; draft không lộ.

## 4. Cleanup

- Không delete Sandbox Wolves.
- Chỉ delete student57 empty team.
- Chỉ delete disposable mentor feedback/assignment sau khi đủ evidence.
- Để replay toàn bộ team chain, ưu tiên full database reset V1–V24.
