DELETE FROM notifications
WHERE id IN (
    SELECT id
    FROM (
        SELECT
            id,
            ROW_NUMBER() OVER (
                PARTITION BY target_id, scheduled_at
                ORDER BY created_at, id
            ) AS duplicate_number
        FROM notifications
        WHERE type = 'DEADLINE_REMINDER'
          AND target_scope = 'EVENT_PARTICIPANTS'
          AND status = 'SCHEDULED'
          AND target_id IS NOT NULL
          AND scheduled_at IS NOT NULL
    ) duplicate_reminders
    WHERE duplicate_number > 1
);

CREATE UNIQUE INDEX uq_notification_round_deadline_reminder
    ON notifications (target_id, scheduled_at)
    WHERE type = 'DEADLINE_REMINDER'
      AND target_scope = 'EVENT_PARTICIPANTS'
      AND status = 'SCHEDULED'
      AND target_id IS NOT NULL
      AND scheduled_at IS NOT NULL;
