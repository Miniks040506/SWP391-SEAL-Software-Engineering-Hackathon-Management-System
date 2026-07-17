package com.t7.seal.service;

import com.t7.seal.response.PageResponse;
import com.t7.seal.response.mentor.MentorTeamDetailResponse;
import com.t7.seal.response.mentor.MentorTeamProgressResponse;
import com.t7.seal.response.mentor.MentorTrackResponse;
import com.t7.seal.response.mentor.MentorSubmissionPageResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface MentorTeamService {
    List<MentorTrackResponse> getMyAssignedTracks(UUID eventId, Authentication authentication);

    PageResponse<MentorTeamProgressResponse> getTeamInAssignedTracks(
            UUID trackId,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    );

    MentorTeamDetailResponse getAssignedTeamDetails(UUID teamId, Authentication authentication);

    MentorSubmissionPageResponse getSubmissions(
            UUID eventId,
            UUID trackId,
            UUID teamId,
            UUID roundId,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    );
}
