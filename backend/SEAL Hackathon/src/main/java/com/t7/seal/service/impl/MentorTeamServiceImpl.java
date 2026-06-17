package com.t7.seal.service.impl;

import com.t7.seal.response.PageResponse;
import com.t7.seal.response.mentor.MentorTeamDetailResponse;
import com.t7.seal.response.mentor.MentorTeamProgressResponse;
import com.t7.seal.response.mentor.MentorTrackResponse;
import com.t7.seal.service.MentorTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MentorTeamServiceImpl implements MentorTeamService {

    @Override
    public List<MentorTrackResponse> getMyAssignedTrack(UUID eventId, Authentication authentication) {
        return List.of();
    }

    @Override
    public PageResponse<MentorTeamProgressResponse> getTeamInAssignedTracks(UUID trackId, String status, String search, int page, int size, Authentication authentication) {
        return null;
    }

    @Override
    public MentorTeamDetailResponse getTeamDetail(UUID teamId, Authentication authentication) {
        return null;
    }
}
