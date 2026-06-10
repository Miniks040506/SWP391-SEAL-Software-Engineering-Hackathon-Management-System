package com.t7.seal.service;

import com.t7.seal.request.mentor.CreateMentorFeedbackRequest;
import com.t7.seal.response.mentor.MentorFeedbackResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface MentorFeedbackService {
    MentorFeedbackResponse createFeedback(UUID teamId,
                                          CreateMentorFeedbackRequest request,
                                          Authentication authentication);

    List<MentorFeedbackResponse> getTeamFeedback(UUID teamId, Authentication authentication);

    List<MentorFeedbackResponse> getMentorTeamFeedback(UUID teamId, Authentication authentication);

    MentorFeedbackResponse getFeedbackById(UUID feedbackId, Authentication authentication);

    MentorFeedbackResponse updateFeedback(UUID feedbackId,
                                          CreateMentorFeedbackRequest request,
                                          Authentication authentication);

    void deleteFeedback(UUID feedbackId, Authentication authentication);

    MentorFeedbackResponse publishFeedback(UUID feedbackId, Authentication authentication);
}
