package com.t7.seal.service;

import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.response.submission.SubmissionDetailResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;
import com.t7.seal.response.submission.SubmissionResponse;
import com.t7.seal.response.submission.SubmissionSummaryResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface SubmissionService {

    SubmissionResponse submitDeliverables(UUID teamId, UUID roundId,
                                          SubmitDeliverablesRequest request,
                                          Authentication authentication);

    SubmissionResponse uploadSubmissionFile(UUID teamId, UUID roundId,
                                            String linkType, String note,
                                            String label, Boolean isPrimary,
                                            Integer displayOrder, Boolean submitNow,
                                            MultipartFile file,
                                            Authentication authentication);

    SubmissionResponse uploadFileToSubmission(UUID submissionId, String linkType,
                                              String label, Boolean isPrimary,
                                              Integer displayOrder, Boolean submitNow,
                                              MultipartFile file,
                                              Authentication authentication);

    List<SubmissionSummaryResponse> getTeamSubmissions(UUID teamId,
                                                       Authentication authentication);

    SubmissionDetailResponse getSubmissionById(UUID submissionId,
                                               Authentication authentication);

    SubmissionDetailResponse getSubmissionForAdmin(UUID submissionId,
                                                   Authentication authentication);

    SubmissionResponse updateSubmission(UUID submissionId,
                                        UpdateSubmissionRequest request,
                                        Authentication authentication);

    SubmissionResponse addSubmissionLinks(UUID submissionId,
                                          SubmissionLinkRequest request,
                                          Authentication authentication);

    SubmissionLinkResponse updateSubmissionLink(UUID linkId,
                                                SubmissionLinkRequest request,
                                                Authentication authentication);

    void deleteSubmissionLink(UUID linkId, Authentication authentication);
}
