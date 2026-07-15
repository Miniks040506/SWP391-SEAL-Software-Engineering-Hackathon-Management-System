-- ============================================================================
-- V19__seed_state_and_error_coverage.sql
-- Supplemental, read-mostly fixtures discovered by comparing the current
-- 300-operation OpenAPI document with the V18/Fable 267-endpoint inventory.
--
-- V18 owns mutable happy-path fixtures. V19 deliberately adds state/filter and
-- failure fixtures that should not be mutated during the normal demo chain.
-- All IDs use the 19... namespace so screenshots, API calls and reset notes can
-- identify them quickly. Test user password remains Password@123.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A. Event and round terminal/intermediate states missing from V1..V18.
-- These rows cover event status ARCHIVED and round statuses PENDING_LOCK/CLOSED.
-- The event is historical and read-only; do not use it for destructive tests.
-- ---------------------------------------------------------------------------
INSERT INTO hackathon_events (
    id, name, slug, season, year, description, banner_url,
    registration_open, registration_close, status, result_published_at,
    created_at, update_at, created_by, completed_at,
    variance_threshold_points, competition_start_at, competition_end_at
) VALUES (
             '19000000-0000-4000-8000-000000000701',
             'SEAL Fall 2024 Archive',
             'seal-fall-2024-archive',
             'FALL', 2024,
             'Read-only archive used for status filters and historical API demonstrations.',
             NULL,
             TIMESTAMP '2024-01-05 08:00:00', TIMESTAMP '2024-01-20 23:59:00',
             'ARCHIVED', TIMESTAMP '2024-02-20 09:00:00',
             TIMESTAMP '2023-12-01 09:00:00', TIMESTAMP '2024-02-21 09:00:00',
             '0406b2de-5dcd-59c7-ad4c-e614f1f201a5',
             TIMESTAMP '2024-02-20 09:00:00', 3.00,
             TIMESTAMP '2024-01-21 08:00:00', TIMESTAMP '2024-02-20 18:00:00'
         );

INSERT INTO rounds (
    id, event_id, name, order_index, description,
    submission_deadline, judging_deadline, status, is_final,
    submission_locked_at, grading_locked_at, advancement_confirmed_at,
    result_published_at, start_at, end_at
) VALUES
      (
          '19000000-0000-4000-8000-000000000711',
          '19000000-0000-4000-8000-000000000701',
          'Archived Pending Lock Snapshot', 1,
          'Historical snapshot for PENDING_LOCK filters; never advance this row.',
          TIMESTAMP '2024-01-31 23:59:00', TIMESTAMP '2024-02-03 23:59:00',
          'PENDING_LOCK', FALSE,
          NULL, NULL, NULL, NULL,
          TIMESTAMP '2024-01-21 08:00:00', TIMESTAMP '2024-02-03 23:59:00'
      ),
      (
          '19000000-0000-4000-8000-000000000712',
          '19000000-0000-4000-8000-000000000701',
          'Archived Closed Snapshot', 2,
          'Historical snapshot for CLOSED filters and forbidden-mutation tests.',
          TIMESTAMP '2024-02-10 23:59:00', TIMESTAMP '2024-02-15 23:59:00',
          'CLOSED', TRUE,
          TIMESTAMP '2024-02-11 00:00:00', TIMESTAMP '2024-02-16 00:00:00', NULL, NULL,
          TIMESTAMP '2024-02-04 08:00:00', TIMESTAMP '2024-02-15 23:59:00'
      );

-- ---------------------------------------------------------------------------
-- B. Notification delivery states. Existing seeds contain DRAFT, SCHEDULED,
-- SENT and FAILED; this adds PARTIALLY_FAILED with one delivered/read recipient
-- and one failed e-mail delivery for list/filter/detail demonstrations.
-- ---------------------------------------------------------------------------
INSERT INTO notifications (
    id, event_id, created_by, type, title, body, target_scope, target_id,
    target_role, channel, scheduled_at, sent_at, status, failure_reason,
    recipient_count, created_at
) VALUES (
             '19000000-0000-4000-8000-000000000801',
             '9d1822f7-ec66-52fe-8569-4faeb6b0a85b',
             '0406b2de-5dcd-59c7-ad4c-e614f1f201a5',
             'GENERAL',
             'Partial delivery fixture',
             'One in-app recipient succeeded while one e-mail delivery failed.',
             'EVENT_PARTICIPANTS', NULL, NULL, 'BOTH',
             NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
             'PARTIALLY_FAILED', 'SMTP rejected one recipient in the test fixture.',
             2, NOW() - INTERVAL '2 days'
         );

INSERT INTO notification_recipients (
    id, notification_id, user_id, delivered_at, read_at, deleted_at, created_at
) VALUES
      (
          '19000000-0000-4000-8000-000000000811',
          '19000000-0000-4000-8000-000000000801',
          '9084de5c-695d-57ca-b0f4-1d0f6153bf85',
          NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL,
          NOW() - INTERVAL '2 days'
      ),
      (
          '19000000-0000-4000-8000-000000000812',
          '19000000-0000-4000-8000-000000000801',
          '84a84e8d-b13d-5865-b50c-6a9a98d7ae63',
          NOW() - INTERVAL '2 days', NULL, NULL,
          NOW() - INTERVAL '2 days'
      );

INSERT INTO email_outbox (
    id, notification_id, to_email, cc_emails, subject, html_body, status,
    attempt_count, scheduled_at, sent_at, last_error, idempotency_key,
    created_at, updated_at
) VALUES (
             '19000000-0000-4000-8000-000000000821',
             '19000000-0000-4000-8000-000000000801',
             'student2@seal.test', NULL,
             'Partial delivery fixture', '<p>Delivery failure fixture.</p>',
             'FAILED', 3, NOW() - INTERVAL '2 days', NULL,
             'Mailbox rejected message after three attempts.',
             'v19-partial-delivery-student2',
             NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
         );

INSERT INTO email_delivery_logs (
    id, email_outbox_id, recipient_email, status, message, created_at
) VALUES (
             '19000000-0000-4000-8000-000000000831',
             '19000000-0000-4000-8000-000000000821',
             'student2@seal.test', 'FAILED',
             '550 mailbox unavailable (intentional V19 fixture).',
             NOW() - INTERVAL '1 day'
         );

-- ---------------------------------------------------------------------------
-- C. Expired export artefact. The row covers an otherwise successful DONE job
-- whose download has expired; list/detail work, while download must reject it.
-- ---------------------------------------------------------------------------
INSERT INTO export_jobs (
    id, requested_by, export_type, params, status, file_url, file_name,
    file_size_bytes, row_count, error_message, requested_at, started_at,
    completed_at, expires_at
) VALUES (
             '19000000-0000-4000-8000-000000000901',
             '0406b2de-5dcd-59c7-ad4c-e614f1f201a5',
             'RANKING',
             '{"eventId":"9d1822f7-ec66-52fe-8569-4faeb6b0a85b","fixture":"expired"}'::jsonb,
             'DONE',
             'https://example.invalid/expired/seal-ranking.csv',
             'seal-ranking-expired.csv', 2048, 12, NULL,
             NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days',
             NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'
         );

-- ---------------------------------------------------------------------------
-- D. Inactive AI document/chunk. Use the active V17 knowledge rows for search
-- and reindex success; this row verifies inactive-content filtering.
-- ---------------------------------------------------------------------------
INSERT INTO ai_knowledge_documents (
    id, title, doc_type, source_ref, visibility, module, content_hash,
    is_active, uploaded_by, created_at, updated_at
) VALUES (
             '19000000-0000-4000-8000-000000000a01',
             'Retired 2024 Rulebook', 'RULEBOOK', 'seed://v19/retired-rulebook',
             'PUBLIC', 'EVENT_RULES',
             '1900000000000000000000000000000000000000000000000000000000000a01',
             FALSE, '99701e51-ee61-5105-8b22-4b546557a27c',
             NOW() - INTERVAL '400 days', NOW() - INTERVAL '30 days'
         );

INSERT INTO ai_knowledge_chunks (
    id, document_id, chunk_index, content, module, use_case_id, role_scope,
    metadata_json, embedding_text, is_active, created_at
) VALUES (
             '19000000-0000-4000-8000-000000000a11',
             '19000000-0000-4000-8000-000000000a01', 0,
             'Retired rule: this content must not appear in active assistant retrieval.',
             'EVENT_RULES', 'AI-INACTIVE-FILTER', 'ALL',
             '{"fixture":"inactive","version":"2024"}',
             'Retired rulebook inactive filter fixture.', FALSE,
             NOW() - INTERVAL '400 days'
         );
