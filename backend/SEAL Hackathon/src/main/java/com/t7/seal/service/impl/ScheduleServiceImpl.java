package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationType;
import com.t7.seal.domain.TeamRegistrationStatus;
import com.t7.seal.entities.CalibrationRound;
import com.t7.seal.entities.EventAnnouncement;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Notification;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.RoundJudgeAssignment;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.CalibrationRoundRepository;
import com.t7.seal.repository.EventAnnouncementRepository;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.NotificationRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.response.schedule.ScheduleEntryResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private static final Set<String> TYPES = Set.of(
            "EVENT", "ROUND", "DEADLINE", "CALIBRATION", "REMINDER", "ANNOUNCEMENT"
    );
    private static final List<NotificationType> REMINDER_TYPES = List.of(
            NotificationType.DEADLINE_REMINDER,
            NotificationType.SUBMISSION_REMINDER,
            NotificationType.JUDGING_REMINDER,
            NotificationType.CALIBRATION_REMINDER
    );

    private final CurrentUserService currentUserService;
    private final HackathonEventRepository eventRepository;
    private final RoundRepository roundRepository;
    private final RoundJudgeAssignmentRepository judgeAssignmentRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final CalibrationRoundRepository calibrationRoundRepository;
    private final NotificationRepository notificationRepository;
    private final EventAnnouncementRepository announcementRepository;
    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    @Override
    public List<ScheduleEntryResponse> getSchedule(
            LocalDateTime from,
            LocalDateTime to,
            UUID eventId,
            String requestedType,
            Authentication authentication
    ) {
        validateRange(from, to);
        String type = normalizeType(requestedType);
        User actor = currentUserService.getCurrentUser(authentication);

        List<HackathonEvent> events;
        List<Round> rounds;
        boolean includeSubmissionDeadlines;
        boolean includeJudgingDeadlines;
        boolean includeCalibrations;
        boolean includeCoordinatorOperations;
        boolean includeEventWindows;

        if (actor.isCoordinator()) {
            events = eventRepository.findByCreatedByIdOrderByYearDescCreatedAtDesc(actor.getId());
            rounds = loadRounds(events);
            includeSubmissionDeadlines = true;
            includeJudgingDeadlines = true;
            includeCalibrations = true;
            includeCoordinatorOperations = true;
            includeEventWindows = true;
        } else if (actor.isJudge()) {
            if (actor.getJudge() == null) {
                throw new ForbiddenException("Judge profile is required to view the schedule.");
            }
            List<RoundJudgeAssignment> assignments = judgeAssignmentRepository
                    .findByJudgeIdWithRoundAndTrack(actor.getJudge().getId());
            rounds = distinct(assignments.stream().map(RoundJudgeAssignment::getRound).toList(), Round::getId);
            events = distinct(rounds.stream().map(Round::getEvent).toList(), HackathonEvent::getId);
            includeSubmissionDeadlines = false;
            includeJudgingDeadlines = true;
            includeCalibrations = true;
            includeCoordinatorOperations = false;
            includeEventWindows = false;
        } else if (actor.isMentor()) {
            events = distinct(
                    mentorAssignmentRepository.findAssignedTracksByUserId(actor.getId(), eventId)
                            .stream()
                            .map(assignment -> assignment.getTrack().getEvent())
                            .toList(),
                    HackathonEvent::getId
            );
            rounds = loadRounds(events);
            includeSubmissionDeadlines = true;
            includeJudgingDeadlines = false;
            includeCalibrations = false;
            includeCoordinatorOperations = false;
            includeEventWindows = true;
        } else if (actor.isStudent()) {
            events = distinct(
                    teamRepository.findActiveTeamByUserId(actor.getId()).stream()
                            .filter(ScheduleServiceImpl::isStudentTeamVisible)
                            .map(team -> team.getTrack().getEvent())
                            .toList(),
                    HackathonEvent::getId
            );
            rounds = loadRounds(events);
            includeSubmissionDeadlines = true;
            includeJudgingDeadlines = false;
            includeCalibrations = false;
            includeCoordinatorOperations = false;
            includeEventWindows = true;
        } else {
            throw new ForbiddenException("Schedule is available to coordinators, judges, mentors, and students.");
        }

        if (eventId != null) {
            events = events.stream().filter(event -> eventId.equals(event.getId())).toList();
        }
        Set<UUID> eventIds = events.stream().map(HackathonEvent::getId).collect(Collectors.toSet());
        rounds = rounds.stream().filter(round -> eventIds.contains(round.getEvent().getId())).toList();

        List<ScheduleEntryResponse> entries = new ArrayList<>();
        if (includeEventWindows) {
            events.forEach(event -> addEventEntries(entries, event));
        }
        rounds.forEach(round -> addRoundEntries(
                entries, round, includeSubmissionDeadlines, includeJudgingDeadlines
        ));

        if (includeCalibrations) {
            for (HackathonEvent event : events) {
                calibrationRoundRepository.findByEventIdOrderByStartAtAsc(event.getId())
                        .forEach(calibration -> entries.add(calibrationEntry(calibration)));
            }
        }

        if (includeCoordinatorOperations) {
            for (HackathonEvent event : events) {
                notificationRepository.findEventReminders(event.getId(), REMINDER_TYPES).stream()
                        .filter(Notification::isScheduled)
                        .forEach(reminder -> entries.add(reminderEntry(reminder)));
                announcementRepository.findByEventIdOrderByCreatedAtDesc(event.getId()).stream()
                        .filter(EventAnnouncement::isScheduled)
                        .forEach(announcement -> entries.add(announcementEntry(announcement)));
            }
        }

        return entries.stream()
                .filter(entry -> type == null || type.equals(entry.type()))
                .filter(entry -> overlaps(entry.startAt(), entry.endAt(), from, to))
                .sorted(Comparator.comparing(ScheduleEntryResponse::startAt)
                        .thenComparing(ScheduleEntryResponse::title))
                .toList();
    }

    static boolean overlaps(LocalDateTime start, LocalDateTime end, LocalDateTime from, LocalDateTime to) {
        LocalDateTime effectiveEnd = end == null ? start : end;
        return !start.isAfter(to) && !effectiveEnd.isBefore(from);
    }

    static boolean isStudentTeamVisible(Team team) {
        return team.getTrack() != null
                && team.getRegistrationStatus() != TeamRegistrationStatus.REJECTED;
    }

    private void validateRange(LocalDateTime from, LocalDateTime to) {
        if (from == null || to == null || !to.isAfter(from)) {
            throw new BadRequestException("A valid schedule range is required.");
        }
        if (Duration.between(from, to).toDays() > 366) {
            throw new BadRequestException("Schedule range cannot exceed 366 days.");
        }
    }

    private String normalizeType(String requestedType) {
        if (requestedType == null || requestedType.isBlank()) return null;
        String type = requestedType.trim().toUpperCase(Locale.ROOT);
        if (!TYPES.contains(type)) throw new BadRequestException("Unknown schedule type.");
        return type;
    }

    private List<Round> loadRounds(List<HackathonEvent> events) {
        // ponytail: existing per-event repository calls are enough for the small event set; batch if event counts grow.
        return events.stream()
                .flatMap(event -> roundRepository.findByEventIdOrderByOrderIndexAsc(event.getId()).stream())
                .toList();
    }

    private static <T> List<T> distinct(List<T> items, Function<T, UUID> id) {
        Map<UUID, T> unique = items.stream().collect(Collectors.toMap(
                id, Function.identity(), (first, ignored) -> first, LinkedHashMap::new
        ));
        return List.copyOf(unique.values());
    }

    private static void addEventEntries(List<ScheduleEntryResponse> entries, HackathonEvent event) {
        entries.add(entry(
                "event:" + event.getId() + ":registration",
                "EVENT", "Registration window", "Registration for " + event.getName(),
                event.getRegistrationOpen(), event.getRegistrationClose(), event, event.getId(), null,
                event.getStatus().name()
        ));
        entries.add(entry(
                "event:" + event.getId() + ":competition",
                "EVENT", "Competition window", event.getName() + " competition period",
                event.getCompetitionStartAt(), event.getCompetitionEndAt(), event, event.getId(), null,
                event.getStatus().name()
        ));
    }

    private static void addRoundEntries(
            List<ScheduleEntryResponse> entries,
            Round round,
            boolean includeSubmissionDeadline,
            boolean includeJudgingDeadline
    ) {
        HackathonEvent event = round.getEvent();
        entries.add(entry(
                "round:" + round.getId(), "ROUND", round.getName(),
                round.getDescription() == null ? "Competition round" : round.getDescription(),
                round.getStartAt(), round.getEndAt(), event, round.getId(), round.getId(), round.getStatus().name()
        ));
        if (includeSubmissionDeadline) {
            entries.add(entry(
                    "round:" + round.getId() + ":submission", "DEADLINE",
                    round.getName() + " submission deadline", "Submissions close at this time.",
                    round.getSubmissionDeadline(), null, event, round.getId(), round.getId(), round.getStatus().name()
            ));
        }
        if (includeJudgingDeadline && round.getJudgingDeadline() != null) {
            entries.add(entry(
                    "round:" + round.getId() + ":judging", "DEADLINE",
                    round.getName() + " judging deadline", "Scoring is due at this time.",
                    round.getJudgingDeadline(), null, event, round.getId(), round.getId(), round.getStatus().name()
            ));
        }
    }

    private static ScheduleEntryResponse calibrationEntry(CalibrationRound calibration) {
        HackathonEvent event = calibration.getEvent();
        return entry(
                "calibration:" + calibration.getId(), "CALIBRATION", "Judge calibration",
                calibration.getDescription() == null ? "Calibration scoring window" : calibration.getDescription(),
                calibration.getStartAt(), calibration.getEndAt(), event, calibration.getId(), null,
                calibration.isDistributionPublished() ? "PUBLISHED" : "ACTIVE"
        );
    }

    private static ScheduleEntryResponse reminderEntry(Notification reminder) {
        return entry(
                "reminder:" + reminder.getId(), "REMINDER", reminder.getTitle(), reminder.getBody(),
                reminder.getScheduledAt(), null, reminder.getEvent(), reminder.getId(), null,
                reminder.getStatus().name()
        );
    }

    private static ScheduleEntryResponse announcementEntry(EventAnnouncement announcement) {
        return entry(
                "announcement:" + announcement.getId(), "ANNOUNCEMENT", announcement.getTitle(), announcement.getContent(),
                announcement.getScheduledAt(), null, announcement.getEvent(), announcement.getId(), null,
                announcement.getStatus().name()
        );
    }

    private static ScheduleEntryResponse entry(
            String id,
            String type,
            String title,
            String description,
            LocalDateTime startAt,
            LocalDateTime endAt,
            HackathonEvent event,
            UUID sourceId,
            UUID roundId,
            String status
    ) {
        return new ScheduleEntryResponse(
                id, type, title, description, startAt, endAt,
                event.getId(), event.getName(), sourceId, roundId, status
        );
    }
}
