package com.t7.seal.entities;

import com.t7.seal.domain.HackathonSeason;
import com.t7.seal.domain.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "hackathon_events",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_event_slug", columnNames = "slug"),
                @UniqueConstraint(name = "uq_event_season_year", columnNames = {"season", "year"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HackathonEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HackathonSeason season;

    @Column(nullable = false)
    private Integer year;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "registration_open", nullable = false)
    private LocalDateTime registrationOpen;

    @Column(name = "registration_close", nullable = false)
    private LocalDateTime registrationClose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.DRAFT;

    @Column(name = "result_published_at")
    private LocalDateTime resultPublishedAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "update_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "event",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Track> tracks = new ArrayList<>();

    @OneToMany(
            mappedBy = "event",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Round> rounds = new ArrayList<>();

    @OneToMany(
            mappedBy = "event",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<EventCriteria> eventCriteria = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private User createdBy;

    // Checks whether registrations can be accepted for the supplied date.
    public boolean isRegistrationWindowOpen(LocalDateTime now) {
        return status == RegistrationStatus.REGISTRATION
                && now != null
                && !now.isBefore(registrationOpen)
                && !now.isAfter(registrationClose);
    }

    // Moves the event from draft into the registration phase.
    public void openRegistration() {
        if (status != RegistrationStatus.DRAFT) {
            throw new IllegalStateException("Event must be in draft status to open registration.");
        }

        status = RegistrationStatus.REGISTRATION;
    }

    // Starts the event after registration has been opened.
    public void startEvent() {
        if (status != RegistrationStatus.REGISTRATION) {
            throw new IllegalStateException("Event must be in registration status to start.");
        }

        status = RegistrationStatus.ONGOING;
    }

    // Starts judging after the event is ongoing.
    public void startJudging() {
        if (status != RegistrationStatus.ONGOING) {
            throw new IllegalStateException("Event must be ongoing to start judging.");
        }

        status = RegistrationStatus.JUDGING;
    }

    // Completes the event after judging has started.
    public void complete() {
        if (status != RegistrationStatus.JUDGING) {
            throw new IllegalStateException("Event must be in judging status to complete.");
        }

        status = RegistrationStatus.COMPLETED;
    }

    // Publishes results once the event is judging or completed.
    public void publishResults(LocalDateTime now) {
        if (status != RegistrationStatus.JUDGING && status != RegistrationStatus.COMPLETED) {
            throw new IllegalStateException("Results can only be published during judging or after completion.");
        }

        resultPublishedAt = now;
    }

    // Checks whether event results have been published.
    public boolean areResultsPublished() {
        return resultPublishedAt != null;
    }
}
