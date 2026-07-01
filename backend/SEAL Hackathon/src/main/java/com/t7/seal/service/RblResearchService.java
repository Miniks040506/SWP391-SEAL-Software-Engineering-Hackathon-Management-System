package com.t7.seal.service;

import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface RblResearchService {
    VarianceDashboardResponse getVarianceDashboard(UUID eventId,
                                                   UUID roundId,
                                                   UUID trackId,
                                                   String criteriaType,
                                                   String judgeType,
                                                   Authentication authentication);

    ExportJobResponse exportAnonymizedDataset(UUID eventId,
                                              ExportRblDatasetRequest request,
                                              Authentication authentication);
}
