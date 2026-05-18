package com.t7.seal.entities;

import com.t7.seal.domain.StudentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "student_type", nullable = false)
    private StudentType studentType;

    @Column(name = "student_code", length = 50, unique = true)
    private String studentCode;

    @Column(name = "university_name", length = 200)
    private String universityName;

    @Column(length = 200)
    private String major;

    @Column(name = "graduation_year")
    private Integer graduationYear;


    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    // True when the student comes from outside FPT (university_name becomes mandatory).
    public boolean isExternal() {
        return studentType == StudentType.EXTERNAL;
    }

    // App-layer validation hook: EXTERNAL students must provide a university name.
    public boolean requiresUniversityName() {
        return isExternal();
    }

    // Minimal completeness check for UC-07 approval: required fields are present.
    public boolean isComplete() {
        return studentCode != null && !studentCode.isBlank()
                && (!isExternal() || (universityName != null && !universityName.isBlank()));
    }

    // Stamp verifiedAt — called together with User.status -> ACTIVE during UC-07.
    public void markVerified(LocalDateTime now) {
        verifiedAt = now;
    }

    // 1 - 1 to User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;
}
