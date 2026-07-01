package com.t7.seal.service.impl;

import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import com.t7.seal.service.RblResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RblResearchServiceImpl implements RblResearchService {

    @Override
    public VarianceDashboardResponse getVarianceDashboard(UUID eventId, UUID roundId, UUID trackId, String criteriaType, String judgeType, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse exportAnonymizedDataset(UUID eventId, ExportRblDatasetRequest request, Authentication authentication) {
        return null;
    }
}
