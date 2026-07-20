# Module 1 — Access, Users, System Config và Audit

> Baseline kiểm thử: SEAL hiện tại, Flyway `V1–V24`, API `/api/v1`.  
> Mục tiêu: chứng minh toàn bộ vòng đời tài khoản, phân quyền quản trị, bảo vệ secret và audit append-only.

## 1. Chuẩn bị

### Tài khoản

| Mục đích | Tài khoản | Trạng thái |
|---|---|---|
| Admin | `admin@seal.test` | ADMIN / ACTIVE |
| Coordinator | `coordinator@seal.test` | COORDINATOR / ACTIVE |
| Participant | `student1@seal.test` | STUDENT / ACTIVE |
| Legacy approve | `pending.student@seal.test` | STUDENT / PENDING_APPROVAL |
| Legacy reject | `pending2.student@seal.test` | STUDENT / PENDING_APPROVAL |
| Unverified | `unverified.student@seal.test` | STUDENT / UNVERIFIED |
| Suspended | `suspended.student@seal.test` | STUDENT / SUSPENDED |
| Deactivated | `deactivated.student@seal.test` | STUDENT / DEACTIVATED |
| Locked | `locked.student@seal.test` | ACTIVE nhưng đang khóa tạm thời |
| Deactivate target | `deactivate.me@seal.test` | STUDENT / ACTIVE |
| Reset success | `reset.active@seal.test` | STUDENT / ACTIVE |
| Reset expired | `reset.expired@seal.test` | STUDENT / ACTIVE |

Mật khẩu seed: `Password@123`.

### Điều kiện trước khi chạy

1. Flyway kết thúc ở V24 và tất cả migration thành công.
2. Frontend `http://localhost:5173` và backend `http://localhost:8080` hoạt động.
3. `/events` tải được khi chưa login.
4. `/admin/health` tải được bằng admin.
5. Dùng cửa sổ thường cho admin/coordinator và Incognito cho student.

### Quy tắc PASS

- Kiểm tra UI sau refresh và HTTP response trong Network.
- Mutation nhạy cảm phải có audit/notification khi thiết kế yêu cầu.
- Không token phải 401; wrong role phải 403 hoặc 404 không làm lộ resource.
- Không response nào được chứa password hash, JWT, reset/verification token hay secret thật.

## 2. Danh sách scenario

| ID | Scenario | Actor | Mode |
|---|---|---|---|
| W1-S01 | Register và verify thành ACTIVE | Guest | UI + API |
| W1-S02 | Resend verification và status guards | Guest | UI + API |
| W1-S03 | Failed-login lock persistence | Guest | API |
| W1-S04 | Refresh, logout và blacklist | Student | API |
| W1-S05 | Forgot/reset/change password | Guest + Student | UI + API |
| W1-S06 | Profile và avatar | Student | UI |
| W1-S07 | User CRUD và guest judge | Admin/Coordinator | UI + API |
| W1-S08 | Legacy approve/reject | Coordinator | UI + API |
| W1-S09 | SystemConfig, health và secret masking | Admin | UI + API |
| W1-S10 | Audit aliases và append-only | Admin/Coordinator | UI + API + SQL |

## W1-S01 — Self-register và active ngay sau verify

### Happy path

1. Logout và mở `/register`.
2. Dùng email duy nhất, ví dụ `demo.student+<timestamp>@example.com`.
3. Nhập full name, phone và password mạnh.
4. Với FPT: chọn FPT và nhập student code `SE123456`.
5. Submit.
6. Xác nhận response `201`, user status `UNVERIFIED`.
7. Mở `/verify-email`, nhập email và code sáu chữ số.
8. Submit và mở `/verify-email/success`.
9. Login ngay bằng tài khoản mới.

### Expected

- Verify đúng đặt `emailVerifiedAt` và chuyển thẳng `UNVERIFIED → ACTIVE`.
- Không có bước coordinator approval cho self-registration bình thường.
- Login thành công và truy cập participant routes.

### Negative

- Đăng ký lại cùng email: 409.
- FPT thiếu code hoặc code `ABC123`: 400.
- EXTERNAL thiếu university: 400.
- Wrong/expired verification code: 400, status vẫn UNVERIFIED.
- Verify tài khoản đã active: controlled 400/409.

### Evidence

Registration response, verification response, user status trước/sau và trang participant sau login.

## W1-S02 — Resend verification và login status guards

1. Ở `/verify-email`, resend cho `unverified.student@seal.test`.
2. Kiểm tra code cũ hết hiệu lực và expiry mới được cập nhật.
3. Thử login lần lượt:
   - `unverified.student@seal.test`;
   - `pending.student@seal.test`;
   - `suspended.student@seal.test`;
   - `deactivated.student@seal.test`;
   - `locked.student@seal.test`.
4. Login `student1@seal.test` để xác nhận success baseline.

### Expected

- Mỗi trạng thái trả thông báo phù hợp, không dùng một thông báo sai cho mọi trường hợp.
- Resend không làm user ACTIVE.
- Login success trả access/refresh token nhưng UI không hiển thị token.

## W1-S03 — Failed-login lock phải được lưu

Mục tiêu của case này là kiểm tra lỗi từng tồn tại khi transaction rollback làm mất `failed_login_count`.

1. Chọn một disposable ACTIVE account hoặc reset database sau test.
2. Gọi login với password sai liên tục tới `app.login.max-failed-attempts` (mặc định 5).
3. Sau từng lần, ghi response và số attempt còn lại.
4. Thử password đúng khi lock chưa hết.
5. Kiểm tra database `failed_login_count` và `locked_until`.

### Expected

- Failure count tăng sau mỗi request dù service ném authentication exception.
- Đến ngưỡng thì `locked_until` được lưu.
- Password đúng vẫn bị chặn trong thời gian lock.
- Không có response 500.

## W1-S04 — Refresh, logout và blacklist

1. Login `student1@seal.test`; lưu access/refresh token trong môi trường test an toàn.
2. `POST /api/v1/auth/refresh-token`: 200.
3. `POST /api/v1/auth/logout`: 204.
4. Dùng lại refresh token vừa logout.
5. Dùng access token đã bị blacklist nếu blacklist feature bật.
6. Login lại để tiếp tục module.

### Expected

- Token hợp lệ refresh được trước logout.
- Token logout không tạo session mới; trả 401/controlled failure.
- `/users/me` không token trả 401.

## W1-S05 — Forgot, reset và change password

### Reset success

1. Mở `/forgot-password`.
2. Nhập `reset.active@seal.test`.
3. Response phải dùng wording chung, không tiết lộ email có tồn tại.
4. Dùng reset code hợp lệ từ local mail/log/fixture.
5. Nhập password mới mạnh và confirmation.
6. Login bằng password mới; thử lại password cũ.

### Negative

- `reset.expired@seal.test`: code hết hạn bị từ chối.
- Confirmation khác nhau: 400.
- Password yếu/rỗng: frontend validation và backend 400.
- Đổi password student1 nhưng nhập wrong current password.
- Reuse password gần nhất: 409/controlled conflict.

### Expected

Password history được enforce; password cũ không login sau reset; không lộ reset token trong API/log/UI.

## W1-S06 — Personal profile và avatar

1. Login student1; mở Profile.
2. Sửa full name/phone/trường được phép; Save và refresh.
3. Upload PNG/JPEG hợp lệ dưới limit.
4. Thử file executable/text giả ảnh và file oversize.
5. Đổi password qua Change Password.

### Expected

- Chỉ profile hiện tại được sửa qua `/users/me`.
- Avatar hợp lệ cập nhật URL/preview.
- 413/415 không thay avatar cũ.
- Invalid phone/year/length không được lưu.

## W1-S07 — Admin/coordinator user management

1. Admin mở `/admin/users`; search/filter role/status.
2. Mở detail qua dialog hiện tại, không dùng route placeholder `/admin/users/:id`.
3. Tạo disposable mentor với email mới.
4. Tạo temporary guest judge với expiry tương lai, affiliation và expertise.
5. Update allowed fields.
6. Coordinator mở user management và xác nhận phạm vi được phép.
7. Cuối module, deactivate đúng `deactivate.me@seal.test`.

### Negative

- Duplicate email: 409.
- Role/status không hợp lệ hoặc guest expiry quá khứ: 400.
- Student gọi `GET /users`: 403.
- Unknown user ID: 404.
- Không deactivate admin được bảo vệ hoặc deactivate lặp.

## W1-S08 — Legacy approval và rejection

Các API này chỉ dành cho manually-created/migrated `PENDING_APPROVAL`, không phải self-registration.

1. Coordinator filter `PENDING_APPROVAL`.
2. Approve `pending.student@seal.test`.
3. Xác nhận user ACTIVE và login được.
4. Reject `pending2.student@seal.test` với reason không rỗng.
5. Kiểm tra audit/notification.

### Negative

- Approve user ACTIVE: 409.
- Reject thiếu reason: 400.
- Review cùng account lần hai: 409.
- Student/Judge actor: 403.

## W1-S09 — SystemConfig, health và secret masking

1. Admin mở `/admin/system-config`.
2. Seed defaults nếu thiếu; chạy seed lần hai để kiểm tra idempotency.
3. Kiểm tra các key:
   - `feature.ai_assistant.enabled`;
   - `feature.ai_assistant.rag.enabled`;
   - `feature.ai_assistant.academic_guardrails.enabled`;
   - `feature.advanced_reminders.enabled`;
   - reminder default values;
   - `ai.rag.max_chunks`.
4. Sửa một reminder integer vô hại; Save và refresh.
5. Kiểm tra encrypted/secret-like rows trong UI và Network.
6. Mở `/admin/health`.

### Expected

- Secret value bị mask cả UI và API khi không yêu cầu/không được phép xem.
- AI provider/model/key thật lấy từ environment, không seed vào SystemConfig.
- Invalid integer/JSON/value type trả 400.
- Coordinator/Student update admin-only config trả 403.
- Health `UP`, không trả API key.

## W1-S10 — Audit aliases và append-only

1. Tạo một profile/config mutation vô hại.
2. Mở Audit Logs và filter actor/action/time.
3. Đối chiếu target ID, before, after và context.
4. Gọi các alias theo quyền:
   - `/api/v1/audit-logs` và `/actions`;
   - `/api/v1/admin/audit-logs` và `/actions`;
   - `/api/v1/coordinator/audit-logs` và `/actions`;
   - `/api/v1/system/audit-logs` và `/actions`.
5. Thử update/delete audit qua API: không có operation tương ứng.
6. Trên local database, thử UPDATE trong transaction rồi ROLLBACK.

### Expected

- Alias trả dữ liệu tương đương trong phạm vi role.
- Audit không sửa/xóa được.
- Không lưu password/token/secret trong before/after/context.

## 3. Checkpoint hoàn thành Module 1

- [ ] Self-register verify thành ACTIVE ngay.
- [ ] Resend và mọi login status guard có evidence.
- [ ] Failed-login count/lock persistence đã kiểm tra.
- [ ] Refresh/logout/blacklist đúng.
- [ ] Reset/change/password history đúng.
- [ ] User CRUD/guest judge/legacy approval đúng quyền.
- [ ] System secret được mask; health không lộ key.
- [ ] Audit searchable và append-only.

## 4. Cleanup

- Reset database nếu đã đổi password của seed account cần dùng lại.
- Chỉ deactivate `deactivate.me@seal.test` ở cuối.
- Không xóa admin, coordinator, student1 hoặc audit rows.
