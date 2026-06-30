package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/export-jobs")
public class ExportJobController {

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{jobId}")
    public ResponseEntity<ExportJobResponse> getExportJob(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.getExportJobById(jobId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{jobId}/download")
    public ResponseEntity<ExportDownloadResponse> downloadExport(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.downloadExport(jobId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{jobId}/download-file")
    public ResponseEntity<Resource> downloadExportFile(
            @PathVariable UUID jobId,
            Authentication authentication
    ) {
        return exportService.downloadExportFile(jobId, authentication);
    }
}
