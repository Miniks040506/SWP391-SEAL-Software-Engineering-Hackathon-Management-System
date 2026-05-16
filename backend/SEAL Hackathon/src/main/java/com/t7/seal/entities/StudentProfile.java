package com.t7.seal.entities;

import com.t7.seal.domain.StudentType;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "user_id", nullable = false)
    private UUID userId;

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
}
