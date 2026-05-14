package com.t7.seal.entities;


import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "disqualification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disqualification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;
}
