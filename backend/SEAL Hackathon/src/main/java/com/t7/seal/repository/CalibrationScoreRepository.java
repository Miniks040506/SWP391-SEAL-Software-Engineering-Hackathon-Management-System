package com.t7.seal.repository;

import com.t7.seal.entities.CalibrationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalibrationScoreRepository extends JpaRepository<CalibrationScore, UUID> {

    List<CalibrationScore> findByCalibrationRoundId(UUID calibrationRoundId);

    List<CalibrationScore> findByCalibrationRoundIdAndJudgeId(UUID calibrationRoundId, UUID judgeId);

    Optional<CalibrationScore> findByCalibrationRoundIdAndJudgeIdAndEventCriteriaId(
            UUID calibrationRoundId,
            UUID judgeId,
            UUID eventCriteriaId
    );

    boolean existsByCalibrationRoundIdAndJudgeId(UUID calibrationRoundId, UUID judgeId);

    long countByCalibrationRoundId(UUID calibrationRoundId);

}
