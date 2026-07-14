package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.ExportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/exports")
@Tag(
        name = "Exports",
        description = "Create, inspect, download, retry, and delete export jobs."
)
public class ExportController {

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping
    public ResponseEntity<ExportJobResponse> createExportJob(
            @Valid @RequestBody CreateExportJobRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.createExportJob(request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping
    public ResponseEntity<PageResponse<ExportJobResponse>> getMyExportJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String exportType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.getMyExportJobs(status, exportType, page, size, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{exportId}")
    public ResponseEntity<ExportJobResponse> getExportJobById(
            @PathVariable("exportId") UUID exportId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.getExportJobById(exportId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{exportId}/download")
    public ResponseEntity<ExportDownloadResponse> downloadExport(
            @PathVariable("exportId") UUID exportId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.downloadExport(exportId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{exportId}/download-file")
    public ResponseEntity<Resource> downloadExportFile(
            @PathVariable("exportId") UUID exportId,
            Authentication authentication
    ) {
        return exportService.downloadExportFile(exportId, authentication);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/{exportId}/retry")
    public ResponseEntity<ExportJobResponse> retryExport(
            @PathVariable("exportId") UUID exportId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.retryExport(exportId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @DeleteMapping("/{exportId}")
    public ResponseEntity<Void> deleteExport(
            @PathVariable("exportId") UUID exportId,
            Authentication authentication
    ) {
        exportService.deleteExport(exportId, authentication);
        return ResponseEntity.noContent().build();
    }
}