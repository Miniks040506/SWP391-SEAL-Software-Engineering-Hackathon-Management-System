package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "calibration_round")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalibrationRound {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
}
