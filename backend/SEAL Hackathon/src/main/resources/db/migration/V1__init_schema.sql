-- =====================================================================
-- V1__init_schema.sql
-- SEAL Hackathon — baseline schema generated from JPA entities.
--
-- PURPOSE: test/local schema so the app can boot with Flyway once
--          spring.jpa.hibernate.ddl-auto is switched to `validate` (or `none`).
--          While ddl-auto stays `create`, Hibernate drops+recreates the schema
--          on every startup and this migration is effectively ignored/overwritten.
--
-- Types map from entities:
--   UUID           -> uuid
--   String         -> varchar(n)  (columnDefinition = "TEXT" -> text)
--   Integer        -> integer     Long -> bigint
--   Float          -> real        Double -> double precision
--   Boolean        -> boolean     LocalDateTime -> timestamp
--   BigDecimal     -> numeric(p,s)  JSONB (@JdbcTypeCode JSON) -> jsonb
--
-- Tables created first (PK + unique), then FKs, then indexes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Core identity
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id                            uuid PRIMARY KEY,
    email                         varchar(255) NOT NULL,
    password_hash                 varchar(255) NOT NULL,
    full_name                     varchar(200) NOT NULL,
    phone                         varchar(20),
    role                          varchar(30)  NOT NULL,
    status                        varchar(30)  NOT NULL DEFAULT 'UNVERIFIED',
    email_verified_at             timestamp,
    email_verification_token      varchar(100),
    email_verification_expires_at timestamp,
    oauth_provider                varchar(30),
    oauth_provider_id             varchar(150),
    password_reset_token          varchar(100),
    password_reset_expires_at     timestamp,
    avatar_url                    varchar(500),
    last_login_at                 timestamp,
    failed_login_count            integer      NOT NULL DEFAULT 0,
    locked_until                  timestamp,
    created_at                    timestamp    NOT NULL,
    updated_at                    timestamp    NOT NULL,
    CONSTRAINT uk_user_email UNIQUE (email),
    CONSTRAINT uk_user_email_verification_token UNIQUE (email_verification_token),
    CONSTRAINT uk_user_password_reset_token UNIQUE (password_reset_token)
);

CREATE TABLE student_profile (
    id              uuid PRIMARY KEY,
    student_type    varchar(255) NOT NULL,
    student_code    varchar(50),
    university_name varchar(200),
    major           varchar(200),
    graduation_year integer,
    verified_at     timestamp,
    user_id         uuid NOT NULL,
    CONSTRAINT uk_student_profile_code UNIQUE (student_code),
    CONSTRAINT uk_student_profile_user UNIQUE (user_id)
);

CREATE TABLE judge (
    id             uuid PRIMARY KEY,
    judge_type     varchar(255) NOT NULL,
    affiliation    varchar(200),
    bio            text,
    expertise_tags varchar(500),
    is_temporary   boolean NOT NULL DEFAULT false,
    expires_at     timestamp,
    user_id        uuid NOT NULL,
    CONSTRAINT uk_judge_user UNIQUE (user_id)
);

-- ---------------------------------------------------------------------
-- Event / configuration
-- ---------------------------------------------------------------------
CREATE TABLE hackathon_events (
    id                  uuid PRIMARY KEY,
    name                varchar(200) NOT NULL,
    slug                varchar(100) NOT NULL,
    season              varchar(255) NOT NULL,
    year                integer      NOT NULL,
    description         text,
    banner_url          varchar(500),
    registration_open   timestamp    NOT NULL,
    registration_close  timestamp    NOT NULL,
    status              varchar(30)  NOT NULL DEFAULT 'DRAFT',
    result_published_at timestamp,
    created_at          timestamp    NOT NULL,
    update_at           timestamp,
    created_by          uuid         NOT NULL,
    CONSTRAINT uq_event_slug UNIQUE (slug),
    CONSTRAINT uq_event_season_year UNIQUE (season, year)
);

CREATE TABLE rounds (
    id                       uuid PRIMARY KEY,
    event_id                 uuid NOT NULL,
    name                     varchar(200) NOT NULL,
    order_index              integer NOT NULL,
    description              text,
    submission_deadline      timestamp NOT NULL,
    judging_deadline         timestamp,
    status                   varchar(255) NOT NULL DEFAULT 'UPCOMING',
    is_final                 boolean NOT NULL DEFAULT false,
    submission_locked_at     timestamp,
    grading_locked_at        timestamp,
    advancement_confirmed_at timestamp,
    result_published_at      timestamp,
    CONSTRAINT uq_round_event_order UNIQUE (event_id, order_index)
);

CREATE TABLE tracks (
    id                  uuid PRIMARY KEY,
    name                varchar(200) NOT NULL,
    description         text,
    required_link_types varchar(200),
    max_teams           integer,
    min_members         integer NOT NULL DEFAULT 3,
    max_members         integer NOT NULL DEFAULT 5,
    display_order       integer NOT NULL DEFAULT 0,
    event_id            uuid NOT NULL
);

CREATE TABLE scoring_criteria (
    id             uuid PRIMARY KEY,
    name           varchar(200) NOT NULL,
    description    text,
    rubric         text,
    max_score      real NOT NULL DEFAULT 10,
    default_weight real NOT NULL DEFAULT 1,
    category       varchar(50) NOT NULL,
    is_technical   boolean NOT NULL,
    is_default     boolean NOT NULL DEFAULT true,
    is_active      boolean NOT NULL DEFAULT true,
    created_at     timestamp NOT NULL
);

CREATE TABLE event_criteria (
    id                    uuid PRIMARY KEY,
    event_id              uuid NOT NULL,
    criteria_id           uuid,
    name_override         varchar(200),
    description_override  text,
    rubric_override       text,
    weight_override       real,
    max_score_override    real,
    is_technical_override boolean,
    is_active             boolean NOT NULL DEFAULT true,
    applies_to_round_ids  text,
    display_order         integer NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- Teams / participation
-- ---------------------------------------------------------------------
CREATE TABLE teams (
    id                uuid PRIMARY KEY,
    track_id          uuid,
    leader_id         uuid NOT NULL,
    name              varchar(200) NOT NULL,
    join_code         varchar(20) NOT NULL,
    join_code_enabled boolean NOT NULL DEFAULT true,
    project_title     varchar(300),
    description       text,
    status            varchar(255) NOT NULL DEFAULT 'FORMING',
    member_count      integer NOT NULL DEFAULT 1,
    registered_at     timestamp,
    created_at        timestamp NOT NULL,
    updated_at        timestamp NOT NULL,
    CONSTRAINT uq_team_joincode UNIQUE (join_code)
);

CREATE TABLE team_member (
    id               uuid PRIMARY KEY,
    role             varchar(255) NOT NULL DEFAULT 'MEMBER',
    joined_at        timestamp NOT NULL,
    left_at          timestamp,
    left_reason      varchar(255),
    left_reason_note text,
    user_id          uuid NOT NULL,
    team_id          uuid NOT NULL
);

CREATE TABLE team_invitations (
    id              uuid PRIMARY KEY,
    team_id         uuid NOT NULL,
    invited_by      uuid NOT NULL,
    invite_email    varchar(255) NOT NULL,
    invitee_user_id uuid,
    token           varchar(100) NOT NULL,
    status          varchar(255) NOT NULL DEFAULT 'PENDING',
    type            varchar(30) NOT NULL DEFAULT 'INVITATION',
    message         text,
    expires_at      timestamp NOT NULL,
    created_at      timestamp NOT NULL,
    respond_at      timestamp,
    response_reason text,
    CONSTRAINT uq_invitation_token UNIQUE (token)
);

-- ---------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------
CREATE TABLE submissions (
    id                uuid PRIMARY KEY,
    team_id           uuid NOT NULL,
    round_id          uuid NOT NULL,
    note              text,
    submitted_at      timestamp NOT NULL,
    updated_at        timestamp NOT NULL,
    status            varchar(30) NOT NULL DEFAULT 'DRAFT',
    submission_number integer NOT NULL DEFAULT 1,
    CONSTRAINT uk_submission_team_round UNIQUE (team_id, round_id)
);

CREATE TABLE submission_links (
    id                 uuid PRIMARY KEY,
    submission_id      uuid NOT NULL,
    link_type          varchar(30) NOT NULL,
    url                varchar(1000) NOT NULL,
    label              varchar(200),
    storage_provider   varchar(30) NOT NULL DEFAULT 'EXTERNAL_URL',
    object_key         varchar(1000),
    original_file_name varchar(300),
    content_type       varchar(150),
    file_size_bytes    bigint,
    repo_metadata      jsonb,
    is_primary         boolean NOT NULL DEFAULT false,
    display_order      integer NOT NULL DEFAULT 0,
    created_at         timestamp NOT NULL,
    updated_at         timestamp NOT NULL
);

-- ---------------------------------------------------------------------
-- Scoring / ranking / advancement
-- ---------------------------------------------------------------------
CREATE TABLE scores (
    id                uuid PRIMARY KEY,
    submission_id     uuid NOT NULL,
    judge_id          uuid NOT NULL,
    event_criteria_id uuid NOT NULL,
    value             real NOT NULL,
    comment           text,
    is_draft          boolean NOT NULL DEFAULT true,
    scored_at         timestamp NOT NULL,
    updated_at        timestamp NOT NULL,
    CONSTRAINT uk_score_submission_judge_criteria UNIQUE (submission_id, judge_id, event_criteria_id)
);

CREATE TABLE rankings (
    id              uuid PRIMARY KEY,
    submission_id   uuid NOT NULL,
    round_id        uuid NOT NULL,
    track_id        uuid NOT NULL,
    total_score     double precision NOT NULL,
    score_breakdown jsonb,
    judge_count     integer NOT NULL,
    rank_position   integer NOT NULL,
    is_advanced     boolean NOT NULL DEFAULT false,
    advance_reason  varchar(200),
    calculated_at   timestamp NOT NULL,
    calculated_by   uuid NOT NULL,
    CONSTRAINT uk_ranking_submission_round UNIQUE (submission_id, round_id)
);

CREATE TABLE advance_rules (
    id          uuid PRIMARY KEY,
    round_id    uuid NOT NULL,
    track_id    uuid,
    rule_type   varchar(255) NOT NULL,
    value       real NOT NULL,
    priority    integer NOT NULL DEFAULT 1,
    description varchar(300)
);

CREATE TABLE round_judge_assignments (
    id               uuid PRIMARY KEY,
    round_id         uuid NOT NULL,
    judge_id         uuid NOT NULL,
    track_id         uuid,
    scoring_progress integer NOT NULL DEFAULT 0,
    total_to_score   integer,
    assigned_by      uuid NOT NULL,
    assigned_at      timestamp NOT NULL,
    reminded_at      timestamp
);

-- ---------------------------------------------------------------------
-- Calibration
-- ---------------------------------------------------------------------
CREATE TABLE calibration_rounds (
    id                        uuid PRIMARY KEY,
    event_id                  uuid NOT NULL,
    sample_submission_id      uuid NOT NULL,
    benchmark_scores          jsonb,
    description               text,
    start_at                  timestamp NOT NULL,
    end_at                    timestamp NOT NULL,
    is_mandatory              boolean NOT NULL DEFAULT true,
    distribution_published_at timestamp
);

CREATE TABLE calibration_scores (
    id                       uuid PRIMARY KEY,
    calibration_round_id     uuid NOT NULL,
    judge_id                 uuid NOT NULL,
    event_criteria_id        uuid NOT NULL,
    value                    real NOT NULL,
    deviation_from_benchmark real,
    judge_comment            text,
    scored_at                timestamp NOT NULL,
    CONSTRAINT uk_calibration_score_round_judge_criteria UNIQUE (calibration_round_id, judge_id, event_criteria_id)
);

-- ---------------------------------------------------------------------
-- Prizes / disqualification
-- ---------------------------------------------------------------------
CREATE TABLE prizes (
    id              uuid PRIMARY KEY,
    event_id        uuid NOT NULL,
    track_id        uuid,
    rank_position   integer NOT NULL,
    title           varchar(200) NOT NULL,
    description     text,
    value           numeric(12, 2),
    currency        varchar(10),
    sponsor_name    varchar(200),
    awarded_team_id uuid,
    awarded_at      timestamp,
    CONSTRAINT uk_prize_event_track_rank UNIQUE (event_id, track_id, rank_position)
);

CREATE TABLE disqualifications (
    id            uuid PRIMARY KEY,
    submission_id uuid NOT NULL,
    issued_by     uuid NOT NULL,
    reason        text NOT NULL,
    evidence_url  varchar(500),
    appeal_note   text,
    appeal_status varchar(30),
    issued_at     timestamp NOT NULL,
    CONSTRAINT uk_disqualification_submission UNIQUE (submission_id)
);

-- ---------------------------------------------------------------------
-- Mentoring
-- ---------------------------------------------------------------------
CREATE TABLE mentor_assignment (
    id          uuid PRIMARY KEY,
    user_id     uuid NOT NULL,
    track_id    uuid NOT NULL,
    assigned_by uuid NOT NULL,
    note        varchar(200),
    assigned_at timestamp NOT NULL
);

CREATE TABLE mentor_feedbacks (
    id                 uuid PRIMARY KEY,
    team_id            uuid NOT NULL,
    mentor_user_id     uuid NOT NULL,
    submission_id      uuid,
    round_id           uuid,
    content            text,
    is_visible_to_team boolean NOT NULL DEFAULT false,
    visibility         varchar(30) NOT NULL DEFAULT 'DRAFT',
    category           varchar(255) NOT NULL DEFAULT 'GENERAL',
    created_at         timestamp NOT NULL,
    updated_at         timestamp NOT NULL,
    published_at       timestamp
);

-- ---------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------
CREATE TABLE event_announcements (
    id                     uuid PRIMARY KEY,
    event_id               uuid NOT NULL,
    title                  varchar(300) NOT NULL,
    content                text NOT NULL,
    is_pinned              boolean NOT NULL DEFAULT false,
    is_result_announcement boolean NOT NULL DEFAULT false,
    published_at           timestamp,
    scheduled_at           timestamp,
    status                 varchar(30) NOT NULL DEFAULT 'DRAFT',
    target_scope           varchar(50) NOT NULL DEFAULT 'ALL',
    target_id              uuid,
    send_email             boolean NOT NULL DEFAULT false,
    send_in_app            boolean NOT NULL DEFAULT true,
    created_by             uuid NOT NULL,
    created_at             timestamp NOT NULL,
    updated_at             timestamp NOT NULL
);

CREATE TABLE announcement_target_tracks (
    announcement_id uuid NOT NULL,
    track_id        uuid
);

CREATE TABLE announcement_target_roles (
    announcement_id uuid NOT NULL,
    role_name       varchar(50)
);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id              uuid PRIMARY KEY,
    event_id        uuid,
    created_by      uuid NOT NULL,
    type            varchar(50) NOT NULL,
    title           varchar(300) NOT NULL,
    body            text NOT NULL,
    target_scope    varchar(50) NOT NULL,
    target_id       uuid,
    target_role     varchar(50),
    channel         varchar(30) NOT NULL DEFAULT 'BOTH',
    scheduled_at    timestamp,
    sent_at         timestamp,
    status          varchar(50) NOT NULL DEFAULT 'DRAFT',
    failure_reason  text,
    recipient_count integer,
    created_at      timestamp NOT NULL
);

CREATE TABLE notification_recipients (
    id              uuid PRIMARY KEY,
    notification_id uuid NOT NULL,
    user_id         uuid NOT NULL,
    delivered_at    timestamp,
    read_at         timestamp,
    deleted_at      timestamp,
    created_at      timestamp NOT NULL,
    CONSTRAINT uk_notification_recipient UNIQUE (notification_id, user_id)
);

CREATE TABLE notification_templates (
    id               uuid PRIMARY KEY,
    type             varchar(60) NOT NULL,
    subject_template varchar(300) NOT NULL,
    title_template   varchar(300) NOT NULL,
    body_template    text NOT NULL,
    html_template    text,
    active           boolean NOT NULL DEFAULT true,
    created_at       timestamp NOT NULL,
    updated_at       timestamp NOT NULL,
    CONSTRAINT uk_notification_template_type UNIQUE (type)
);

-- ---------------------------------------------------------------------
-- Audit / system config / exports
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    id           uuid PRIMARY KEY,
    actor_id     uuid NOT NULL,
    action_type  varchar(100) NOT NULL,
    target_table varchar(100) NOT NULL,
    target_id    uuid NOT NULL,
    before_state jsonb,
    after_state  jsonb,
    context      jsonb,
    ip_address   varchar(50),
    user_agent   varchar(500),
    created_at   timestamp NOT NULL
);

CREATE TABLE system_configs (
    id           uuid PRIMARY KEY,
    config_key   varchar(200) NOT NULL,
    config_value text,
    value_type   varchar(30) NOT NULL DEFAULT 'STRING',
    is_encrypted boolean NOT NULL DEFAULT false,
    category     varchar(30) NOT NULL DEFAULT 'GENERAL',
    description  text,
    is_active    boolean NOT NULL DEFAULT true,
    updated_by   uuid NOT NULL,
    created_at   timestamp NOT NULL,
    updated_at   timestamp NOT NULL,
    CONSTRAINT uq_sysconfig_key UNIQUE (config_key)
);

CREATE TABLE export_jobs (
    id              uuid PRIMARY KEY,
    requested_by    uuid NOT NULL,
    export_type     varchar(100) NOT NULL,
    params          jsonb NOT NULL,
    status          varchar(50) NOT NULL DEFAULT 'QUEUED',
    file_url        varchar(500),
    file_name       varchar(200),
    file_size_bytes bigint,
    row_count       integer,
    error_message   text,
    requested_at    timestamp NOT NULL,
    started_at      timestamp,
    completed_at    timestamp,
    expires_at      timestamp
);

-- ---------------------------------------------------------------------
-- Email delivery
-- ---------------------------------------------------------------------
CREATE TABLE email_outbox (
    id              uuid PRIMARY KEY,
    notification_id uuid,
    to_email        varchar(255) NOT NULL,
    cc_emails       text,
    subject         varchar(300) NOT NULL,
    html_body       text NOT NULL,
    status          varchar(30) NOT NULL DEFAULT 'PENDING',
    attempt_count   integer NOT NULL DEFAULT 0,
    scheduled_at    timestamp,
    sent_at         timestamp,
    last_error      text,
    idempotency_key varchar(160) NOT NULL,
    created_at      timestamp NOT NULL,
    updated_at      timestamp NOT NULL,
    CONSTRAINT uk_email_outbox_idempotency UNIQUE (idempotency_key)
);

CREATE TABLE email_delivery_logs (
    id              uuid PRIMARY KEY,
    email_outbox_id uuid NOT NULL,
    recipient_email varchar(255) NOT NULL,
    status          varchar(30) NOT NULL,
    message         text,
    created_at      timestamp NOT NULL
);

-- =====================================================================
-- Foreign keys
-- =====================================================================
ALTER TABLE student_profile          ADD CONSTRAINT fk_student_profile_user       FOREIGN KEY (user_id)              REFERENCES users (id);
ALTER TABLE judge                    ADD CONSTRAINT fk_judge_user                 FOREIGN KEY (user_id)              REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE hackathon_events         ADD CONSTRAINT fk_event_created_by           FOREIGN KEY (created_by)           REFERENCES users (id);

ALTER TABLE rounds                   ADD CONSTRAINT fk_round_event                FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);
ALTER TABLE tracks                   ADD CONSTRAINT fk_track_event                FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);

ALTER TABLE event_criteria           ADD CONSTRAINT fk_event_criteria_event       FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);
ALTER TABLE event_criteria           ADD CONSTRAINT fk_event_criteria_template    FOREIGN KEY (criteria_id)          REFERENCES scoring_criteria (id);

ALTER TABLE teams                    ADD CONSTRAINT fk_team_track                 FOREIGN KEY (track_id)             REFERENCES tracks (id);
ALTER TABLE teams                    ADD CONSTRAINT fk_team_leader                FOREIGN KEY (leader_id)            REFERENCES users (id);

ALTER TABLE team_member              ADD CONSTRAINT fk_team_member_user           FOREIGN KEY (user_id)              REFERENCES users (id);
ALTER TABLE team_member              ADD CONSTRAINT fk_team_member_team           FOREIGN KEY (team_id)              REFERENCES teams (id);

ALTER TABLE team_invitations         ADD CONSTRAINT fk_invitation_team            FOREIGN KEY (team_id)              REFERENCES teams (id);
ALTER TABLE team_invitations         ADD CONSTRAINT fk_invitation_invited_by      FOREIGN KEY (invited_by)           REFERENCES users (id);
ALTER TABLE team_invitations         ADD CONSTRAINT fk_invitation_invitee         FOREIGN KEY (invitee_user_id)      REFERENCES users (id);

ALTER TABLE submissions              ADD CONSTRAINT fk_submission_team            FOREIGN KEY (team_id)              REFERENCES teams (id);
ALTER TABLE submissions              ADD CONSTRAINT fk_submission_round           FOREIGN KEY (round_id)             REFERENCES rounds (id);

ALTER TABLE submission_links         ADD CONSTRAINT fk_submission_link_submission FOREIGN KEY (submission_id)        REFERENCES submissions (id);

ALTER TABLE scores                   ADD CONSTRAINT fk_score_submission           FOREIGN KEY (submission_id)        REFERENCES submissions (id);
ALTER TABLE scores                   ADD CONSTRAINT fk_score_judge                FOREIGN KEY (judge_id)             REFERENCES judge (id);
ALTER TABLE scores                   ADD CONSTRAINT fk_score_event_criteria       FOREIGN KEY (event_criteria_id)    REFERENCES event_criteria (id);

ALTER TABLE rankings                 ADD CONSTRAINT fk_ranking_submission         FOREIGN KEY (submission_id)        REFERENCES submissions (id);
ALTER TABLE rankings                 ADD CONSTRAINT fk_ranking_round              FOREIGN KEY (round_id)             REFERENCES rounds (id);
ALTER TABLE rankings                 ADD CONSTRAINT fk_ranking_track              FOREIGN KEY (track_id)             REFERENCES tracks (id);
ALTER TABLE rankings                 ADD CONSTRAINT fk_ranking_calculated_by      FOREIGN KEY (calculated_by)        REFERENCES users (id);

ALTER TABLE advance_rules            ADD CONSTRAINT fk_advance_rule_round         FOREIGN KEY (round_id)             REFERENCES rounds (id);
ALTER TABLE advance_rules            ADD CONSTRAINT fk_advance_rule_track         FOREIGN KEY (track_id)             REFERENCES tracks (id);

ALTER TABLE round_judge_assignments  ADD CONSTRAINT fk_rja_round                  FOREIGN KEY (round_id)             REFERENCES rounds (id);
ALTER TABLE round_judge_assignments  ADD CONSTRAINT fk_rja_judge                  FOREIGN KEY (judge_id)             REFERENCES judge (id);
ALTER TABLE round_judge_assignments  ADD CONSTRAINT fk_rja_track                  FOREIGN KEY (track_id)             REFERENCES tracks (id);
ALTER TABLE round_judge_assignments  ADD CONSTRAINT fk_rja_assigned_by            FOREIGN KEY (assigned_by)          REFERENCES users (id);

ALTER TABLE calibration_rounds       ADD CONSTRAINT fk_calibration_round_event    FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);
ALTER TABLE calibration_rounds       ADD CONSTRAINT fk_calibration_round_sample   FOREIGN KEY (sample_submission_id) REFERENCES submissions (id);

ALTER TABLE calibration_scores       ADD CONSTRAINT fk_calibration_score_round    FOREIGN KEY (calibration_round_id) REFERENCES calibration_rounds (id);
ALTER TABLE calibration_scores       ADD CONSTRAINT fk_calibration_score_judge    FOREIGN KEY (judge_id)             REFERENCES judge (id);
ALTER TABLE calibration_scores       ADD CONSTRAINT fk_calibration_score_criteria FOREIGN KEY (event_criteria_id)    REFERENCES event_criteria (id);

ALTER TABLE prizes                   ADD CONSTRAINT fk_prize_event                FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);
ALTER TABLE prizes                   ADD CONSTRAINT fk_prize_track                FOREIGN KEY (track_id)             REFERENCES tracks (id);
ALTER TABLE prizes                   ADD CONSTRAINT fk_prize_awarded_team         FOREIGN KEY (awarded_team_id)      REFERENCES teams (id);

ALTER TABLE disqualifications        ADD CONSTRAINT fk_disqualification_submission FOREIGN KEY (submission_id)       REFERENCES submissions (id);
ALTER TABLE disqualifications        ADD CONSTRAINT fk_disqualification_issued_by  FOREIGN KEY (issued_by)           REFERENCES users (id);

ALTER TABLE mentor_assignment        ADD CONSTRAINT fk_mentor_assignment_user     FOREIGN KEY (user_id)              REFERENCES users (id);
ALTER TABLE mentor_assignment        ADD CONSTRAINT fk_mentor_assignment_track    FOREIGN KEY (track_id)             REFERENCES tracks (id);
ALTER TABLE mentor_assignment        ADD CONSTRAINT fk_mentor_assignment_assigned FOREIGN KEY (assigned_by)          REFERENCES users (id);

ALTER TABLE mentor_feedbacks         ADD CONSTRAINT fk_mentor_feedback_team       FOREIGN KEY (team_id)              REFERENCES teams (id);
ALTER TABLE mentor_feedbacks         ADD CONSTRAINT fk_mentor_feedback_mentor     FOREIGN KEY (mentor_user_id)       REFERENCES users (id);
ALTER TABLE mentor_feedbacks         ADD CONSTRAINT fk_mentor_feedback_submission FOREIGN KEY (submission_id)        REFERENCES submissions (id);
ALTER TABLE mentor_feedbacks         ADD CONSTRAINT fk_mentor_feedback_round      FOREIGN KEY (round_id)             REFERENCES rounds (id);

ALTER TABLE event_announcements      ADD CONSTRAINT fk_announcement_event         FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);
ALTER TABLE event_announcements      ADD CONSTRAINT fk_announcement_created_by    FOREIGN KEY (created_by)           REFERENCES users (id);

ALTER TABLE announcement_target_tracks ADD CONSTRAINT fk_ann_target_track_ann     FOREIGN KEY (announcement_id)      REFERENCES event_announcements (id);
ALTER TABLE announcement_target_roles  ADD CONSTRAINT fk_ann_target_role_ann      FOREIGN KEY (announcement_id)      REFERENCES event_announcements (id);

ALTER TABLE notifications            ADD CONSTRAINT fk_notification_event         FOREIGN KEY (event_id)             REFERENCES hackathon_events (id);
ALTER TABLE notifications            ADD CONSTRAINT fk_notification_created_by     FOREIGN KEY (created_by)           REFERENCES users (id);

ALTER TABLE notification_recipients  ADD CONSTRAINT fk_notif_recipient_notif      FOREIGN KEY (notification_id)      REFERENCES notifications (id);
ALTER TABLE notification_recipients  ADD CONSTRAINT fk_notif_recipient_user       FOREIGN KEY (user_id)              REFERENCES users (id);

ALTER TABLE audit_logs               ADD CONSTRAINT fk_audit_log_actor            FOREIGN KEY (actor_id)             REFERENCES users (id);

ALTER TABLE system_configs           ADD CONSTRAINT fk_system_config_updated_by   FOREIGN KEY (updated_by)           REFERENCES users (id);

ALTER TABLE export_jobs              ADD CONSTRAINT fk_export_job_requested_by     FOREIGN KEY (requested_by)         REFERENCES users (id);

ALTER TABLE email_outbox             ADD CONSTRAINT fk_email_outbox_notification  FOREIGN KEY (notification_id)      REFERENCES notifications (id);
ALTER TABLE email_delivery_logs      ADD CONSTRAINT fk_email_delivery_outbox      FOREIGN KEY (email_outbox_id)      REFERENCES email_outbox (id);

-- =====================================================================
-- Indexes (as declared on entities)
-- =====================================================================
CREATE INDEX idx_user_role                 ON users (role);
CREATE INDEX idx_user_status               ON users (status);
CREATE INDEX idx_user_email_verified_at    ON users (email_verified_at);
CREATE INDEX idx_user_last_login_at        ON users (last_login_at);
CREATE INDEX idx_user_locked_until         ON users (locked_until);

CREATE INDEX idx_team_invitation_team_type_status ON team_invitations (team_id, type, status);
CREATE INDEX idx_team_invitation_invitee_type     ON team_invitations (invitee_user_id, type);

CREATE INDEX idx_submission_team          ON submissions (team_id);
CREATE INDEX idx_submission_round         ON submissions (round_id);
CREATE INDEX idx_submission_status        ON submissions (status);
CREATE INDEX idx_submission_submitted_at  ON submissions (submitted_at);

CREATE INDEX idx_submission_link_submission    ON submission_links (submission_id);
CREATE INDEX idx_submission_link_type          ON submission_links (link_type);
CREATE INDEX idx_submission_link_primary       ON submission_links (is_primary);
CREATE INDEX idx_submission_link_display_order ON submission_links (display_order);

CREATE INDEX idx_scoring_criteria_category     ON scoring_criteria (category);
CREATE INDEX idx_scoring_criteria_is_technical ON scoring_criteria (is_technical);
CREATE INDEX idx_scoring_criteria_is_default   ON scoring_criteria (is_default);
CREATE INDEX idx_scoring_criteria_is_active    ON scoring_criteria (is_active);

CREATE INDEX idx_event_criteria_event    ON event_criteria (event_id);
CREATE INDEX idx_event_criteria_template ON event_criteria (criteria_id);
CREATE INDEX idx_event_criteria_active   ON event_criteria (is_active);
CREATE INDEX idx_event_criteria_order    ON event_criteria (display_order);

CREATE INDEX idx_score_submission     ON scores (submission_id);
CREATE INDEX idx_score_judge          ON scores (judge_id);
CREATE INDEX idx_score_event_criteria ON scores (event_criteria_id);
CREATE INDEX idx_score_is_draft       ON scores (is_draft);
CREATE INDEX idx_score_scored_at      ON scores (scored_at);

CREATE INDEX idx_ranking_submission        ON rankings (submission_id);
CREATE INDEX idx_ranking_round             ON rankings (round_id);
CREATE INDEX idx_ranking_track             ON rankings (track_id);
CREATE INDEX idx_ranking_round_track_rank  ON rankings (round_id, track_id, rank_position);
CREATE INDEX idx_ranking_is_advanced       ON rankings (is_advanced);
CREATE INDEX idx_ranking_calculated_by     ON rankings (calculated_by);

CREATE INDEX idx_rja_round       ON round_judge_assignments (round_id);
CREATE INDEX idx_rja_judge       ON round_judge_assignments (judge_id);
CREATE INDEX idx_rja_track       ON round_judge_assignments (track_id);
CREATE INDEX idx_rja_assigned_by ON round_judge_assignments (assigned_by);

CREATE INDEX idx_calibration_round_event                  ON calibration_rounds (event_id);
CREATE INDEX idx_calibration_round_sample_submission      ON calibration_rounds (sample_submission_id);
CREATE INDEX idx_calibration_round_start_end              ON calibration_rounds (start_at, end_at);
CREATE INDEX idx_calibration_round_distribution_published ON calibration_rounds (distribution_published_at);

CREATE INDEX idx_calibration_score_round          ON calibration_scores (calibration_round_id);
CREATE INDEX idx_calibration_score_judge          ON calibration_scores (judge_id);
CREATE INDEX idx_calibration_score_event_criteria ON calibration_scores (event_criteria_id);
CREATE INDEX idx_calibration_score_scored_at      ON calibration_scores (scored_at);

CREATE INDEX idx_prize_event         ON prizes (event_id);
CREATE INDEX idx_prize_track         ON prizes (track_id);
CREATE INDEX idx_prize_awarded_team  ON prizes (awarded_team_id);
CREATE INDEX idx_prize_rank_position ON prizes (rank_position);

CREATE INDEX idx_disqualification_submission    ON disqualifications (submission_id);
CREATE INDEX idx_disqualification_issued_by     ON disqualifications (issued_by);
CREATE INDEX idx_disqualification_appeal_status ON disqualifications (appeal_status);
CREATE INDEX idx_disqualification_issued_at     ON disqualifications (issued_at);

CREATE INDEX idx_mentor_feedback_team       ON mentor_feedbacks (team_id);
CREATE INDEX idx_mentor_feedback_mentor     ON mentor_feedbacks (mentor_user_id);
CREATE INDEX idx_mentor_feedback_submission ON mentor_feedbacks (submission_id);
CREATE INDEX idx_mentor_feedback_visibility ON mentor_feedbacks (visibility);

CREATE INDEX idx_event_announcement_event        ON event_announcements (event_id);
CREATE INDEX idx_event_announcement_created_by   ON event_announcements (created_by);
CREATE INDEX idx_event_announcement_published_at ON event_announcements (published_at);
CREATE INDEX idx_event_announcement_status       ON event_announcements (status);
CREATE INDEX idx_event_announcement_scheduled_at ON event_announcements (scheduled_at);
CREATE INDEX idx_event_announcement_is_pinned    ON event_announcements (is_pinned);
CREATE INDEX idx_event_announcement_is_result    ON event_announcements (is_result_announcement);

CREATE INDEX idx_notification_event        ON notifications (event_id);
CREATE INDEX idx_notification_created_by   ON notifications (created_by);
CREATE INDEX idx_notification_type         ON notifications (type);
CREATE INDEX idx_notification_target_scope ON notifications (target_scope);
CREATE INDEX idx_notification_status       ON notifications (status);
CREATE INDEX idx_notification_scheduled_at ON notifications (scheduled_at);
CREATE INDEX idx_notification_sent_at      ON notifications (sent_at);
CREATE INDEX idx_notification_created_at   ON notifications (created_at);

CREATE INDEX idx_notification_recipient_notification ON notification_recipients (notification_id);
CREATE INDEX idx_notification_recipient_user         ON notification_recipients (user_id);
CREATE INDEX idx_notification_recipient_read         ON notification_recipients (read_at);
CREATE INDEX idx_notification_recipient_deleted      ON notification_recipients (deleted_at);
CREATE INDEX idx_notification_recipient_created      ON notification_recipients (created_at);

CREATE INDEX idx_audit_log_actor       ON audit_logs (actor_id);
CREATE INDEX idx_audit_log_action_type ON audit_logs (action_type);
CREATE INDEX idx_audit_log_target      ON audit_logs (target_table, target_id);
CREATE INDEX idx_audit_log_created_at  ON audit_logs (created_at);

CREATE INDEX idx_export_job_requested_by ON export_jobs (requested_by);
CREATE INDEX idx_export_job_export_type  ON export_jobs (export_type);
CREATE INDEX idx_export_job_status       ON export_jobs (status);
CREATE INDEX idx_export_job_requested_at ON export_jobs (requested_at);
CREATE INDEX idx_export_job_completed_at ON export_jobs (completed_at);
CREATE INDEX idx_export_job_expires_at   ON export_jobs (expires_at);

CREATE INDEX idx_email_outbox_notification ON email_outbox (notification_id);
CREATE INDEX idx_email_outbox_status       ON email_outbox (status);
CREATE INDEX idx_email_outbox_scheduled    ON email_outbox (scheduled_at);
CREATE INDEX idx_email_outbox_created      ON email_outbox (created_at);

CREATE INDEX idx_email_delivery_outbox ON email_delivery_logs (email_outbox_id);
CREATE INDEX idx_email_delivery_status ON email_delivery_logs (status);
CREATE INDEX idx_email_delivery_created ON email_delivery_logs (created_at);
