package com.t7.seal.service.impl;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScheduleServiceImplTest {

    @Test
    void overlapIncludesBoundaryAndExcludesPastEntries() {
        LocalDateTime from = LocalDateTime.of(2026, 7, 22, 0, 0);
        LocalDateTime to = from.plusDays(7);

        assertTrue(ScheduleServiceImpl.overlaps(from.minusDays(1), from, from, to));
        assertTrue(ScheduleServiceImpl.overlaps(to, null, from, to));
        assertFalse(ScheduleServiceImpl.overlaps(from.minusDays(2), from.minusSeconds(1), from, to));
    }
}
