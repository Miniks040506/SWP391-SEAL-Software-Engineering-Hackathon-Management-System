package com.t7.seal.request.reminder;

public record GenerateEventRemindersRequest(
        Integer submissionDaysBefore,
        Integer judgingDaysBefore,
        Boolean includeSubmissionReminders,
        Boolean includeJudgingReminders,
        Boolean emailEnabled
) {}
