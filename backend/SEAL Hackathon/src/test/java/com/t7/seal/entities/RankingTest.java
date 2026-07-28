package com.t7.seal.entities;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RankingTest {

    @Test
    void approvingTiePreservesTieMetadataAndClearsManualReview() {
        Ranking ranking = new Ranking();
        ranking.markTie("round:track:9.50", 2);

        ranking.approveTie();

        assertTrue(ranking.getTied());
        assertEquals("round:track:9.50", ranking.getTieGroupKey());
        assertEquals(2, ranking.getTieGroupSize());
        assertFalse(ranking.getManualResolutionRequired());
    }
}
