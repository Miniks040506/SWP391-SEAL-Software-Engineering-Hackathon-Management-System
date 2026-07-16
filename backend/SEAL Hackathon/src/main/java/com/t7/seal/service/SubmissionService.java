package com.t7.seal.service;

import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.request.submission.UpdateSubmissionLinkMetadataRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.submission.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface SubmissionService {

    SubmissionRequirementsResponse getSubmissionRequirements(UUID teamId,
                                                              UUID roundId,
                                                              Authentication authentication);

    SubmissionResponse submitDeliverables(UUID teamId, UUID roundId,
                                          SubmitDeliverablesRequest request,
                                          Authentication authentication);

    SubmissionResponse saveSubmissionDraft(UUID teamId, UUID roundId,
                                           UpdateSubmissionRequest request,
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

    List<SubmissionAttemptResponse> getSubmissionAttempts(UUID submissionId,
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

    SubmissionLinkResponse updateSubmissionLinkMetadata(UUID linkId,
                                                         UpdateSubmissionLinkMetadataRequest request,
                                                         Authentication authentication);

    void deleteSubmissionLink(UUID linkId, Authentication authentication);

    FileDownloadUrlResponse createSubmissionFileDownloadUrl(UUID linkId,
                                                            Authentication authentication);

    FileDownloadUrlResponse createSubmissionAttemptFileDownloadUrl(
            UUID submissionId,
            UUID evidenceId,
            Authentication authentication
    );

    SubmissionResponse submitExistingSubmission(UUID submissionId,
                                                Authentication authentication);

    PageResponse<CoordinatorSubmissionSummaryResponse> getEventSubmissions(UUID eventId, UUID roundId,
                                                                           UUID trackId, String status,
                                                                           String search,
                                                                           int page, int size,
                                                                           Authentication authentication);

    List<SubmissionSummaryResponse> getRoundSubmissions(UUID roundId,
                                                        Authentication authentication);

    List<SubmissionSummaryResponse> getTrackSubmissions(UUID trackId,
                                                        Authentication authentication);

    List<SubmissionSummaryResponse> getMentorTeamSubmissions(UUID teamId,
                                                             Authentication authentication);

    SubmissionDetailResponse getMentorSubmissionById(UUID submissionId,
                                                     Authentication authentication);
}
