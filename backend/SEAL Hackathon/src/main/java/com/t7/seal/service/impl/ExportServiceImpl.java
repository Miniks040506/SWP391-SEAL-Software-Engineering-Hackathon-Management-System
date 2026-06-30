package com.t7.seal.service.impl;

import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {
    @Override
    public ExportJobResponse createExportJob(CreateExportJobRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse exportEventRanking(UUID eventId, EventExportRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse exportEventScores(UUID eventId, EventExportRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse exportEventTeamList(UUID eventId, EventExportRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public PageResponse<ExportJobResponse> getMyExportJobs(String status, String exportType, int page, int size, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse getExportJobById(UUID exportId, Authentication authentication) {
        return null;
    }

    @Override
    public ExportDownloadResponse downloadExport(UUID exportId, Authentication authentication) {
        return null;
    }

    @Override
    public ResponseEntity<Resource> downloadExportFile(UUID exportId, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse retryExport(UUID exportId, Authentication authentication) {
        return null;
    }

    @Override
    public void deleteExport(UUID exportId, Authentication authentication) {

    }
}
