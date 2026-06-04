package com.t7.seal.service;

import com.t7.seal.request.criteria.CreateScoringCriteriaRequest;
import com.t7.seal.request.criteria.UpdateScoringCriteriaRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.criteria.ScoringCriteriaResponse;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface CriteriaService {
    PageResponse<ScoringCriteriaResponse> getScoringCriteria(Boolean isActive, Boolean isTechnical, String category, int page, int size);

    ScoringCriteriaResponse createScoringCriteria(CreateScoringCriteriaRequest request, Authentication authentication);

    ScoringCriteriaResponse getScoringCriteriaById(UUID criteriaId);

    ScoringCriteriaResponse updateScoringCriteria(UUID criteriaId, UpdateScoringCriteriaRequest request, Authentication authentication);

    ScoringCriteriaResponse deactivateScoringCriteria(UUID criteriaId, Authentication authentication);

    ScoringCriteriaResponse activateScoringCriteria(UUID criteriaId, Authentication authentication);
}
