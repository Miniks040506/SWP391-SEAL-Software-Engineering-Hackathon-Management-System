package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "hackathon_event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HackathonEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;
}
