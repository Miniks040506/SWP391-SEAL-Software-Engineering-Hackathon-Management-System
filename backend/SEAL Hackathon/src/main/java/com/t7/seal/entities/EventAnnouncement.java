package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "event_announcement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAnnouncement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
}
