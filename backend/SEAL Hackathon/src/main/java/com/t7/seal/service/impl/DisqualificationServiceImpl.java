package com.t7.seal.service.impl;

import com.t7.seal.request.results.CreateDisqualificationRequest;
import com.t7.seal.request.results.DisqualifySubmissionRequest;
import com.t7.seal.request.results.OverturnDisqualificationRequest;
import com.t7.seal.request.results.UpdateAppealRequest;
import com.t7.seal.response.results.DisqualificationResponse;
import com.t7.seal.service.DisqualificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DisqualificationServiceImpl implements DisqualificationService {

    @Override
    public DisqualificationResponse disqualifySubmission(CreateDisqualificationRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public DisqualificationResponse disqualifySubmission(UUID submissionId, DisqualifySubmissionRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public DisqualificationResponse getDisqualificationById(UUID disqualificationId, Authentication authentication) {
        return null;
    }

    @Override
    public List<DisqualificationResponse> getDisqualificationsByEvent(UUID eventId, UUID roundId, UUID trackId, String appealStatus, Authentication authentication) {
        return List.of();
    }

    @Override
    public DisqualificationResponse updateAppeal(UUID disqualificationId, UpdateAppealRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public DisqualificationResponse overturnDisqualification(UUID disqualificationId, OverturnDisqualificationRequest request, Authentication authentication) {
        return null;
    }
}
