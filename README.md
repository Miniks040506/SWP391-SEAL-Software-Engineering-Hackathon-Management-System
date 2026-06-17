<div align="center">

# 🏆 SEAL — Software Engineering Hackathon Management System

**A full-stack platform for running academic software-engineering hackathons end to end — from account approval and team formation to blind judging, ranking, prize publication, and research-grade scoring exports.**

Built for the Software Engineering Department & PDP at **FPT University HCM**.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/status-active%20development-yellow.svg)](#-project-status)

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Project Status](#-project-status)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Domain Model](#-domain-model)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Security Model](#-security-model)
- [Research (Inter-Rater Reliability)](#-research-inter-rater-reliability)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 📖 About the Project

**SEAL** (Software Engineering Agile League) is an annual academic hackathon organized by the Software Engineering Department and PDP at FPT University HCM. Each academic year can host up to three events — **Spring**, **Summer**, and **Fall** — and each event can contain multiple competition rounds (e.g. *Preliminary* and *Final*).

This platform replaces the manual, spreadsheet-driven process with a single system that manages the **full competition lifecycle**:

> Account approval → Team formation → Track registration → Round configuration → Submission → Blind judging → Ranking → Advancement → Prize publication → Audit & research export

Beyond operations, SEAL doubles as a **research data platform**: every individual `judge × criterion × submission` score is preserved so the organizing committee can study **inter-rater reliability** (ICC, Krippendorff's α) of hackathon scoring.

### Why it exists

The legacy process suffers from recurring pain points that SEAL is built to eliminate:

- Team and track management handled by hand — slow and error-prone.
- Judges scoring in separate Excel files, requiring manual collection and re-entry.
- Delayed, inconsistent ranking calculation.
- Fragmented communication between coordinators, mentors, judges, and teams.
- No reliable audit trail for scoring decisions and disqualifications.
- Scoring-consistency research data that is hard to collect cleanly.

---

## 🚦 Project Status

> **This project is under active development (SWP391 capstone).** Both the backend and the role-based frontend are substantially built out across all modules; work continues on remaining edge cases and polish.

| Area | State |
|---|---|
| Domain model | ✅ 32 JPA entities + 31 enums + 32 repositories |
| Service layer | ✅ 28 service interfaces + 30 implementations |
| REST surface | ✅ 22 controllers with request/response DTO records (63 request / 89 response) |
| Authentication | ✅ JWT (access + refresh), email verification, password reset, token blacklist, OAuth2 social login |
| Integrations | ✅ Cloudinary (images), S3 (submission files), GitHub/GitLab metadata, async SMTP email outbox |
| Frontend | ✅ Feature-based React SPA with dedicated experiences for Admin, Coordinator, Judge, Mentor, and Participant roles |
| Database schema | ⚙️ Hibernate-managed (`ddl-auto: update` in dev, `validate` in prod); Flyway is enabled and reserved for future versioned migrations |

---

## ✨ Features

Features are organized into six functional modules.

### 1. User & Access Management
- Email/password registration with email verification before approval.
- JWT-based authentication (access + refresh tokens) plus **OAuth2 social login**, with optional server-side token blacklist on logout.
- Time-limited password reset via email code.
- Account approval workflow (Coordinator) and role management (Admin).
- Temporary guest-judge accounts.
- Failed-login lockout and personal profile management.

### 2. Event & Configuration Management
- Create and manage events by **season + year**.
- Configure registration windows, competition **tracks**, and **rounds** (with submission/judging deadlines).
- Define advancement rules (top-N, minimum score, percentage, wildcard).
- Manage scoring-criteria templates with per-event overrides.
- Assign mentors to tracks and judges to rounds/tracks.
- Manage prizes and calibration rounds.
- Runtime configuration through `SystemConfig`.

### 3. Team & Participation Management
- Create teams of **3–5 members**.
- Invite members by email token; accept / decline invitations.
- Edit team profile, transfer leadership, remove members, leave a team.
- Register finalized teams for a track.
- Mentor view of assigned teams; member view of roster and progress.

### 4. Submission & Grading
- Submit / update deliverable links per round (repo, demo, slides, report, video, …).
- Optional GitHub/GitLab repository metadata extraction.
- **Lock submission** window before judging begins.
- **Blind scoring** — raw score stored per `judge × submission × criterion`.
- Calibration rounds with benchmark scores.
- **Lock grading** window before ranking calculation.
- Mentor feedback for assigned teams.

### 5. Results, Audit & Research
- Per-round, per-track ranking calculation and advancement confirmation.
- Publish official results and award configured prizes.
- Disqualify teams/submissions (mandatory reason) and recalculate rankings.
- Append-only **audit log** for all sensitive operations.
- Score-variance dashboard for judge-consistency monitoring.
- Anonymized research dataset export (hashed judge IDs).

### 6. Cross-Cutting System Configuration
- Centralized, runtime-changeable settings keyed by `config_key`.
- Encrypted values for secrets (integration tokens, SMTP), masked in API responses.
- Feature flags (e.g. mandatory calibration, token blacklist, integrations).

---

## 🛠 Tech Stack

### Backend
| Category | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.0.6 (Web MVC, Security, Data JPA, Mail, Actuator, OAuth2) |
| Persistence | Hibernate ORM, PostgreSQL driver |
| Migrations | Flyway (PostgreSQL) |
| Auth | JWT via `jjwt` 0.13, BCrypt password hashing, OAuth2 social login |
| Validation | Jakarta Bean Validation |
| File storage | Cloudinary (images/banners), AWS S3 (submission files) |
| Integrations | GitHub / GitLab repository metadata, SMTP email outbox + scheduler |
| API docs | SpringDoc OpenAPI (Swagger UI) |
| Build | Maven (with wrapper), Lombok |

### Frontend
| Category | Technology |
|---|---|
| Language | TypeScript |
| Framework | React 19 + Vite 8 |
| UI | MUI 9 (+ Icons), Tailwind CSS 4 |
| Data fetching | TanStack Query 5, Axios |
| State | Zustand 5 |
| Routing | React Router DOM 7 |
| Forms & validation | React Hook Form 7 + Zod 4 |
| Charts | Recharts 3 |
| Notifications / dates | notistack, date-fns |
| Tooling | ESLint, Prettier |

### Database
- PostgreSQL 15+
- UUID primary keys across all main tables
- JSONB for flexible payloads (repo metadata, score breakdowns, export params, audit states)
- Partial unique indexes for active-only constraints

---

## 🏗 Architecture

The system is a **decoupled SPA + REST API**:

```mermaid
flowchart LR
    SPA["React SPA<br/>(Vite · MUI · TanStack Query)"]
    API["Spring Boot REST API<br/>controller → service → repository → entity"]
    DB[("PostgreSQL")]

    SPA -- "HTTPS / JSON · Bearer JWT (/api/v1)" --> API
    API -- "JSON response" --> SPA
    API -- "JPA / Hibernate" --> DB
```

### Backend layering

Strict, one-directional flow — controllers never touch repositories directly:

```mermaid
flowchart LR
    C[Controller] --> S[Service interface] --> I[Service impl] --> R[Repository] --> E[(Entity)]
```

- **Controllers** are thin REST adapters returning `ResponseEntity<T>`; all routes live under `/api/v1` via `ApiPaths.API_V1`.
- **Services** own business logic, transaction boundaries, input normalization, and audit logging.
- **Repositories** extend `JpaRepository<Entity, UUID>`.
- **DTOs** are Java `record`s under `request/<module>` and `response/<module>` — entities are never exposed directly.

### Module map

```mermaid
graph TD
    A[User & Access Management] --> B[Event & Configuration Management]
    B --> C[Team & Participation Management]
    B --> D[Submission & Grading]
    C --> D
    D --> E[Results, Audit & Research]
    B --> E
    G[System Configuration] --> D
    G --> E
```

---

## 🗃 Domain Model

The schema comprises **32 JPA entities** grouped by module:

| Group | Entities |
|---|---|
| User & Access | `User`, `StudentProfile`, `Judge`, `TeamInvitation` |
| Event & Configuration | `HackathonEvent`, `Track`, `Round`, `AdvanceRule`, `SystemConfig` |
| Team & Participation | `Team`, `TeamMember`, `MentorAssignment`, `MentorFeedback` |
| Submission & Grading | `ScoringCriteria`, `EventCriteria`, `RoundJudgeAssignment`, `Submission`, `SubmissionLink`, `Score`, `Ranking`, `Disqualification` |
| Results & Research | `CalibrationRound`, `CalibrationScore`, `Prize`, `AuditLog`, `ExportJob` |
| Notifications & Email | `Notification`, `NotificationRecipient`, `NotificationTemplate`, `EventAnnouncement`, `EmailOutbox`, `EmailDeliveryLog` |

### Core relationships

```mermaid
erDiagram
    USER ||--o| STUDENT_PROFILE : has
    USER ||--o| JUDGE : has
    USER ||--o{ TEAM_MEMBER : joins
    USER ||--o{ TEAM : leads
    USER ||--o{ AUDIT_LOG : performs

    HACKATHON_EVENT ||--o{ TRACK : contains
    HACKATHON_EVENT ||--o{ ROUND : contains
    HACKATHON_EVENT ||--o{ EVENT_CRITERIA : configures
    HACKATHON_EVENT ||--o{ PRIZE : defines
    HACKATHON_EVENT ||--o{ CALIBRATION_ROUND : contains

    TRACK ||--o{ TEAM : registers
    TRACK ||--o{ MENTOR_ASSIGNMENT : assigned
    ROUND ||--o{ SUBMISSION : receives
    ROUND ||--o{ ROUND_JUDGE_ASSIGNMENT : assigns
    ROUND ||--o{ RANKING : calculates

    TEAM ||--o{ TEAM_MEMBER : includes
    TEAM ||--o{ TEAM_INVITATION : sends
    TEAM ||--o{ SUBMISSION : creates
    TEAM ||--o{ MENTOR_FEEDBACK : receives

    SUBMISSION ||--o{ SUBMISSION_LINK : contains
    SUBMISSION ||--o{ SCORE : receives
    SUBMISSION ||--o| RANKING : produces
    SUBMISSION ||--o| DISQUALIFICATION : may_have

    EVENT_CRITERIA ||--o{ SCORE : scored_by
    JUDGE ||--o{ SCORE : gives
    JUDGE ||--o{ ROUND_JUDGE_ASSIGNMENT : assigned
    CALIBRATION_ROUND ||--o{ CALIBRATION_SCORE : contains
```

### Key constraints

| Entity | Unique constraint |
|---|---|
| `User` | `email` |
| `StudentProfile` / `Judge` | `user_id` |
| `HackathonEvent` | `(season, year)` |
| `Round` | `(event_id, order_index)` |
| `TeamMember` | one active membership per `(user_id, team_id)` |
| `Submission` | one per `(team_id, round_id)` |
| `Score` | one per `(submission_id, judge_id, event_criteria_id)` |
| `Ranking` | one snapshot per `(submission_id, round_id)` |
| `Prize` | `(event_id, track_id, rank_position)` |
| `SystemConfig` | `config_key` |

> `Submission`, `Score`, `Ranking`, `Disqualification`, and `AuditLog` are **never hard-deleted** after publication.

---

## 📂 Repository Structure

```text
SWP391-SEAL-.../
├── backend/
│   └── SEAL Hackathon/                 # Spring Boot service
│       ├── src/main/java/com/t7/seal/
│       │   ├── config/                 # SecurityConfig, ApiPaths, Cloudinary, Jackson, beans
│       │   ├── controller/             # 22 thin REST controllers
│       │   ├── domain/                 # 31 enums (UserRole, SubmissionStatus, …)
│       │   ├── dto/                    # Auth principal types
│       │   ├── entities/               # 32 JPA entities
│       │   ├── filter/                 # JwtAuthenticationFilter
│       │   ├── infrastructure/         # Converters, security utils
│       │   ├── repository/             # 32 Spring Data JPA repositories
│       │   ├── request/<module>/       # Inbound DTO records
│       │   ├── response/<module>/      # Outbound DTO records
│       │   ├── security/               # JWT / OAuth2 support
│       │   └── service/                # 28 service interfaces + impl/ (30 implementations)
│       ├── src/main/resources/
│       │   ├── application.yaml         # base config (profile: dev)
│       │   ├── application-dev.yaml
│       │   ├── application-prod.yaml
│       │   └── db/migration/            # Flyway migrations (reserved)
│       ├── pom.xml
│       └── mvnw / mvnw.cmd
│
├── frontend/
│   └── Seal_Hackathon/                  # React + Vite SPA
│       ├── src/
│       │   ├── api/                     # 24 typed API modules + Axios client (Bearer JWT)
│       │   ├── app/                     # App, router, providers, theme
│       │   ├── components/              # common / layout / guards (AuthGuard, RoleGuard)
│       │   ├── features/                # feature modules by role & domain:
│       │   │   ├── auth/                #   login, register, verify, reset, OAuth callback
│       │   │   ├── admin/               #   user management, audit logs, dashboard
│       │   │   ├── coordinator/         #   event creation/editing, announcements, teams
│       │   │   ├── judge/               #   grading, calibration, dashboard
│       │   │   ├── mentor/              #   assigned teams, feedback, submissions
│       │   │   ├── criteria/            #   scoring & event criteria management
│       │   │   ├── events/ ranking/     #   public event pages, leaderboard
│       │   │   ├── teams/ submissions/  #   team lifecycle, deliverable submission
│       │   │   ├── notification/        #   notification inbox & bell
│       │   │   └── profile/             #   personal profile & avatar
│       │   │       (each: pages / components / hooks / schemas)
│       │   ├── hooks/  stores/  types/  utils/
│       │   └── main.tsx
│       ├── .env.example
│       ├── vite.config.ts
│       └── package.json
│
├── README.md
└── SECURITY.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 21+ |
| Maven | 3.9+ (or use the bundled wrapper) |
| Node.js | 20+ |
| PostgreSQL | 15+ |
| Git | latest |

### 1. Clone

```bash
git clone https://github.com/Miniks040506/SWP391-SEAL-Software-Engineering-Hackathon-Management-System.git
cd SWP391-SEAL-Software-Engineering-Hackathon-Management-System
```

### 2. Create the database

```bash
createdb seal_hackathon
# or, in psql:  CREATE DATABASE seal_hackathon;
```

### 3. Run the backend

```bash
cd "backend/SEAL Hackathon"

# provide credentials & secrets via environment variables (see Configuration)
# then start the app:

# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

| Resource | URL |
|---|---|
| API base | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI spec | `http://localhost:8080/v3/api-docs` |
| Actuator health | `http://localhost:8080/actuator/health` |

### 4. Run the frontend

```bash
cd frontend/Seal_Hackathon
cp .env.example .env        # adjust VITE_API_BASE_URL if needed
npm install
npm run dev
```

Frontend runs at **`http://localhost:5173`**.

### Build & test

```bash
# backend
cd "backend/SEAL Hackathon" && ./mvnw clean package      # add -DskipTests to skip
./mvnw test

# frontend
cd frontend/Seal_Hackathon && npm run build && npm run lint
```

---

## ⚙️ Configuration

The backend reads configuration from environment variables (with sensible local defaults in `application.yaml`). **Never commit real secrets** — provide them via your shell or a local `.env`.

### Backend environment variables

| Variable | Purpose | Example |
|---|---|---|
| `DB_USERNAME` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `your-password` |
| `JWT_SECRET` | HMAC signing key (≥ 32 chars) | `change-me-to-a-long-random-secret` |
| `JWT_HEADER` | Auth header name | `Authorization` |
| `MAIL_USERNAME` | SMTP username | `you@gmail.com` |
| `MAIL_PASSWORD` | SMTP app password | `your-app-password` |
| `FRONTEND_URL` | Allowed frontend origin | `http://localhost:5173` |
| `GITHUB_TOKEN` | GitHub API token (optional) | _empty_ |
| `GITLAB_TOKEN` | GitLab API token (optional) | _empty_ |

> Token lifetimes default to **1 hour** (access) and **7 days** (refresh). The active Spring profile defaults to `dev`.

### Frontend environment variables (`frontend/Seal_Hackathon/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_API_NAME=SEAL Hackathon Management System
```

---

## 📚 API Documentation

All endpoints are versioned under **`/api/v1`** and documented interactively via **Swagger UI** (`/swagger-ui.html`) once the backend is running.

The REST surface is organized into **22 controllers**:

| Module | Controller(s) | Responsibility |
|---|---|---|
| Auth & Users | `AuthController`, `UserController` | Registration, login, OAuth2, verification, password reset, profile, admin user management |
| Events | `EventController`, `TrackController`, `RoundController` | Event/track/round CRUD, submission & grading locks |
| Configuration | `CriteriaController`, `SystemController`, `PrizeController` | Scoring criteria, system config, prizes |
| Teams | `TeamController`, `TeamInvitationController`, `CoordinatorTeamController` | Team lifecycle, invitations, registration, leadership, coordinator team views |
| Judging | `JudgeController`, `GradingController`, `CalibrationController`, `MentorController` | Judge assignments, blind scoring, calibration, mentor feedback |
| Submissions | `SubmissionController` | Deliverable submission and locking |
| Results & Research | `RankingController`, `DisqualificationController`, `ExportController` | Ranking, advancement, disqualification, dataset export |
| Comms & Audit | `NotificationController`, `AnnouncementController`, `AuditLogController` | Notifications, event announcements, audit-log queries |

Responses use a consistent envelope: paginated lists return `PageResponse<T>`, and errors return `ApiErrorResponse` from a global `@RestControllerAdvice`.

---

## 🔐 Security Model

### Authentication
- Stateless JWT (access + refresh) issued on login; `JwtAuthenticationFilter` runs ahead of the username/password filter.
- Login is allowed only for **verified + active** accounts; `UNVERIFIED`, `PENDING_APPROVAL`, `LOCKED`, and `SUSPENDED` accounts are rejected.
- Passwords hashed with BCrypt. Email verification (6-digit, 30 min) and password reset (6-digit, 15 min) codes.
- Optional server-side logout via `TokenBlacklistService` when the feature flag is enabled.

### Authorization (roles)

| Role | Scope |
|---|---|
| `STUDENT` | Own profile, team membership, submissions, own scores |
| `MENTOR` | Read assigned teams, write mentor feedback |
| `JUDGE` | Assigned grading list, calibration, scoring |
| `COORDINATOR` | Events, rounds, tracks, mentors, judges, prizes, results, announcements, exports |
| `ADMIN` | Users, criteria templates, system config, audit logs |

### Auditing
Sensitive operations (approval, suspension, verification, password change, role change, submission/grading locks, score writes, ranking recalculation, advancement, publication, disqualification, prize awards, system-config changes) write an **append-only `AuditLog`** entry within the same transaction.

> See [`SECURITY.md`](SECURITY.md) for the full security policy and disclosure process.

---

## 🔬 Research (Inter-Rater Reliability)

SEAL preserves raw scoring data so the organizing committee can analyze how consistently judges evaluate the same submission.

**Research question:** *How consistent are hackathon evaluation scores across different judges evaluating the same submission?*

| ID | Sub-question | Data support |
|---|---|---|
| RQ1 | Overall inter-rater reliability of SEAL scoring? | Raw `Score` rows, `CalibrationScore`, anonymized export |
| RQ2 | Which criteria show highest/lowest agreement? | `ScoringCriteria.is_technical`, variance dashboard |
| RQ3 | Does judge type affect consistency? | `Judge.judge_type` (`INTERNAL` / `GUEST`) |

**Capabilities:** every judge score stored per submission × criterion, calibration rounds with benchmarks, a variance dashboard, and **anonymized CSV export** (SHA-256 hashed judge IDs, team names stripped) ready for **ICC** and **Krippendorff's α** analysis.

---

## 🗺 Roadmap

Delivered across 6 sprints, split between two backend tracks (BE1: Auth/Event/Team — BE2: Scoring/Research/Export).

| Sprint | BE1 — Auth / Event / Team | BE2 — Scoring / Research / Export |
|---:|---|---|
| 1 | Auth flow, email verify, reset, logout, profile | Event CRUD, round fields, `SystemConfig` + encryption |
| 2 | Team lifecycle, register, leave, transfer leader | Advance rules, mentor assignment, criteria, prizes |
| 3 | Team invitations, mentor feedback | Judge assignment, scoring progress, calibration setup |
| 4 | Submission, edit, lock submission | Calibration scoring, blind scoring, lock grading |
| 5 | Notifications, announcements, progress views | Ranking & advancement services, leaderboard |
| 6 | Publish results, award prizes, audit queries | Disqualification, variance dashboard, research export |

---

## 🤝 Contributing

This is an academic capstone project. For contributors on the team:

### Branch naming
```
feature/<short-feature>     fix/<short-bug>
refactor/<short-area>       docs/<short-doc>
```

### Commit style
Short, imperative, lowercase — e.g. `add user entity`, `implement jwt login`, `fix team invitation validation`.

### Before opening a PR
- [ ] Code compiles and existing tests pass
- [ ] No secrets or `.env` committed
- [ ] New endpoints registered in `SecurityConfig` with correct guards
- [ ] Request DTOs validated; sensitive operations write `AuditLog`
- [ ] Lombok / DI conventions followed (constructor injection, no field injection)

> Detailed engineering conventions live in [`AGENTS.md`](AGENTS.md).

---

## 👥 Team

Developed by **Team T7** for the SWP391 course at FPT University HCM.

| Contributor |
|---|
| Miniks040506 |
| nguyen2312-dev |
| VoNMThu |
| DatIT-026 |

---

## 📄 License

No license has been declared yet. Until a license file is added, this code is provided for **academic and educational use** within the scope of the SWP391 course. Contact the team before any external reuse.

---

<div align="center">

Made with ☕ and 🏆 by Team T7 — FPT University HCM

</div>
