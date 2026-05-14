package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "student_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;
}
