package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "round")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;
}
