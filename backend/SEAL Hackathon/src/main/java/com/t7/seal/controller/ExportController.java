package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/exports")
public class ExportController {
    @PostMapping
    public ResponseEntity<ExportJobResponse> createExportJob(
            @Valid @RequestBody CreateExportJobRequest request
    ) {
        return null;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ExportJobResponse>> getMyExportJobs (
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String exportType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @GetMapping("/{exportId}")
    public ResponseEntity<ExportJobResponse> getExportJobById (
            @PathVariable("exportId") UUID exportId
    ) {
        return null;
    }

    @GetMapping("/{exportId}/download")
    public ResponseEntity<ExportDownloadResponse> downloadExport (
            @PathVariable("exportId") UUID exportId
    ) {
        return null;
    }

    @PostMapping("/{exportId}/retry")
    public ResponseEntity<ExportJobResponse> retryExport(
            @PathVariable("exportId") UUID exportId
    ) {
        return null;
    }

    @DeleteMapping("/{exportId}")
    public ResponseEntity<Void> deleteExport(
            @PathVariable("exportId") UUID exportId
    ) {
        return null;
    }
}
