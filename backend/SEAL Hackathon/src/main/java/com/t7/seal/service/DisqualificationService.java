package com.t7.seal.service;

import com.t7.seal.request.results.CreateDisqualificationRequest;
import com.t7.seal.request.results.DisqualifySubmissionRequest;
import com.t7.seal.request.results.OverturnDisqualificationRequest;
import com.t7.seal.request.results.UpdateAppealRequest;
import com.t7.seal.response.results.DisqualificationResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface DisqualificationService {

    DisqualificationResponse disqualifySubmission(CreateDisqualificationRequest request,
                                                  Authentication authentication);

    DisqualificationResponse disqualifySubmission(UUID submissionId,
                                                  DisqualifySubmissionRequest request,
                                                  Authentication authentication);

    DisqualificationResponse getDisqualificationById(UUID disqualificationId,
                                                     Authentication authentication);

    List<DisqualificationResponse> getDisqualificationsByEvent(UUID eventId,
                                                               UUID roundId,
                                                               UUID trackId,
                                                               String appealStatus,
                                                               Authentication authentication);

    DisqualificationResponse updateAppeal(UUID disqualificationId,
                                          UpdateAppealRequest request,
                                          Authentication authentication);

    DisqualificationResponse overturnDisqualification(UUID disqualificationId,
                                                      OverturnDisqualificationRequest request,
                                                      Authentication authentication);
}
