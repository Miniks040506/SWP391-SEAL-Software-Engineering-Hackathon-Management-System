# Week 1 — Access, users, system and audit

## Goal and accounts

Demonstrate the complete identity lifecycle: self-register, verify e-mail, become active immediately, login/refresh/logout, recover/change password, manage profile, administer users, protect secrets and inspect append-only audit records.

Primary accounts: `admin@seal.test`, `coordinator@seal.test`, `student1@seal.test`; password `Password@123`.

## W1-S01 — Self-register and activate immediately

**Success path — Guest**

1. Open `/register` and select the appropriate student type.
2. Enter a never-used email, full name, phone and a strong password.
3. For FPT, enter student code format `SE123456`; for EXTERNAL, enter both external student code and university.
4. Click **Create account**. Expect `201`, status `UNVERIFIED`, and navigation/instruction to verify e-mail.
5. Open `/verify-email`, enter the same e-mail and six-digit verification code, then submit.
6. Expect the response message **“Email verified successfully. Your account is now active.”**, status `ACTIVE`, and `/verify-email/success`.
7. Click the login action, sign in with the new account and confirm participant pages are available. There is no coordinator approval step.

**Failure checks**

- Submit the same e-mail again: expect 409 `Email already exists`.
- FPT without student code or with `ABC123`: expect 400 and no user row.
- EXTERNAL without university: expect 400.
- Wrong/expired verification code: expect 400 and status remains `UNVERIFIED`.
- Verify the same account twice: expect 400 `already been verified`.

## W1-S02 — Resend verification and login status guards

1. At `/verify-email`, use `unverified.student@seal.test` and click the visible resend action. Expect a new code and a renewed expiry.
2. Attempt login with that account before verification: expect 401 and “verify your email”.
3. Attempt login with `pending.student@seal.test`: expect 401 waiting-for-approval. This is a manually seeded legacy state, not the self-registration flow.
4. Attempt login with `suspended.student@seal.test`: expect 401.
5. Attempt login with `deactivated.student@seal.test`: expect 401.
6. Attempt login with `locked.student@seal.test`: expect locked-account response and remaining lock duration.
7. Login with `student1@seal.test`: expect access and refresh tokens and redirect to participant home.

## W1-S03 — Refresh, logout and blacklist

Use Swagger/Network because refresh is normally automatic in Axios.

1. Login as `student1@seal.test`; copy the refresh token.
2. Call `POST /api/v1/auth/refresh-token`; expect 200 and a new access token.
3. Call `POST /api/v1/auth/logout` with the current bearer/refresh data; expect 204.
4. Repeat refresh with the logged-out token; expect 401 and no new session.
5. Call `GET /api/v1/users/me` without bearer token; expect 401.
6. Log in again to continue.

## W1-S04 — Forgot/reset password

1. Open `/forgot-password` as Guest.
2. Enter `reset.active@seal.test` and submit. Confirm the generic success wording does not reveal whether an arbitrary e-mail exists.
3. Continue to the reset-code/password step using the valid local seeded token/code documented in the V17 row or the code captured from local mail logs.
4. Enter matching strong password/confirmation and submit. Expect 200; login succeeds with the new password and fails with `Password@123`.
5. Reset the database before later replay, or reserve this account exclusively for this scenario.

**Failure checks**

- Use the expired fixture `reset.expired@seal.test`: expect 400 invalid/expired code.
- Mismatched confirmation: 400.
- Reuse a recent password for `student1@seal.test`: 409/controlled validation failure.
- Weak/blank password: client validation and backend 400.

## W1-S05 — Personal profile, avatar and password

1. Login as `student1@seal.test`; open the avatar menu → **Profile** (`/personal` or role profile route).
2. Change editable full name/phone/profile fields and click **Save profile**. Refresh and confirm persistence.
3. Upload a valid PNG/JPEG under the configured size; expect preview and updated avatar URL.
4. Open **Change Password**, enter current password and a new non-reused password; submit and re-login.

**Failure checks**

- Invalid phone/year/data length: no save, readable field error.
- Non-image or oversized avatar: 413/415; existing avatar remains.
- Wrong current password, reused password, or mismatched confirmation: controlled 400/409.
- A second user cannot update another profile through `/users/me`.

## W1-S06 — Admin/coordinator create and inspect users

1. Login as `admin@seal.test`; sidebar → **Users**.
2. Search/filter by role and status, then open a row detail. Verify password hashes/tokens are never rendered.
3. Click **Create New User**; create a disposable mentor or judge with a unique e-mail. Expect the new row after refresh.
4. Create a temporary guest judge with future expiry. Verify judge type, affiliation/expertise and expiry.
5. Login as `coordinator@seal.test`; sidebar → **Users** and confirm authorized management subset.

**Failure checks**

- Duplicate e-mail: 409.
- Invalid role/status/guest expiry in the past: 400.
- Login as `student1@seal.test` and call `GET /api/v1/users`: 403.
- Unknown user UUID: 404.

## W1-S07 — Legacy approval and rejection

These APIs test manually created or migrated `PENDING_APPROVAL` accounts only.

1. Login as coordinator; **Users** → filter `PENDING_APPROVAL`.
2. Open `pending.student@seal.test` and choose **Approve**. Confirm status becomes `ACTIVE` and that the account can login.
3. Open `pending2.student@seal.test`, choose **Reject**, enter a non-empty reason, and confirm the resulting status/message.
4. Check Notifications/Audit Logs for the corresponding action when applicable.

**Failure checks**

- Approve an already active account: 409.
- Reject without reason: 400.
- Student role attempts either API: 403.

## W1-S08 — Update and deactivate a user

1. Login as admin/coordinator; **Users** → search `deactivate.me@seal.test`.
2. Edit allowed fields and click **Save Changes**; refresh and verify.
3. Use **Deactivate user** only after all other tests for this account. Expect `DEACTIVATED` and login denial.

Failure: deactivate an already deactivated account, the current protected admin, or unknown UUID; expect controlled 400/404/409 and no collateral change.

## W1-S09 — System config defaults, update and secret masking

1. Login as `admin@seal.test`; sidebar → **System Config**.
2. Filter by category; locate normal values and encrypted rows `integration.github.token` / `smtp.password`.
3. Verify encrypted values display masked (`*****`) and never expose placeholder ciphertext.
4. Change a harmless local value such as a reminder default, then click **Save (1)**. Refresh and confirm type-preserving persistence.
5. Click the seed-defaults action only once if defaults are missing; repeated execution must be idempotent.

**Failure checks**

- Put a non-integer value into an integer config: 400.
- Student/coordinator updates admin-only config: 403.
- Unknown key: 404.
- Confirm Network response also masks encrypted values.

## W1-S10 — Health and audit aliases

1. Admin sidebar → **Health** → refresh; expect application/database components healthy.
2. Perform one harmless profile/config mutation.
3. Sidebar → **Audit Logs**; filter by actor, action, event/team and time range. Open the new row and verify before/after/context.
4. Call all supported aliases and expect equivalent data under their permitted role:
   - `/api/v1/audit-logs` and `/actions`
   - `/api/v1/admin/audit-logs` and `/actions`
   - `/api/v1/coordinator/audit-logs` and `/actions`
   - `/api/v1/system/audit-logs` and `/actions`
5. Attempt audit update/delete directly. No such mutation API exists; database trigger from V10 must also reject SQL update/delete in a local verification transaction.

## Week 1 completion checkpoint

- Self-registered verified account is `ACTIVE` immediately.
- All status-specific login failures are captured.
- Reset/change/refresh/logout behavior is captured.
- User CRUD/legacy approval authorization is captured.
- System secrets remain masked.
- Audit rows are searchable and append-only.

