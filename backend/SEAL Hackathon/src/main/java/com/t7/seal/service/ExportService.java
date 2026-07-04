package com.t7.seal.service;

import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface ExportService {

    ExportJobResponse createExportJob(CreateExportJobRequest request,
                                      Authentication authentication);

    ExportJobResponse exportEventRanking(UUID eventId,
                                         EventExportRequest request,
                                         Authentication authentication);

    ExportJobResponse exportEventScores(UUID eventId,
                                        EventExportRequest request,
                                        Authentication authentication);

    ExportJobResponse exportEventTeamList(UUID eventId,
                                          EventExportRequest request,
                                          Authentication authentication);

    ExportJobResponse exportEventRblDataset(UUID eventId,
                                            ExportRblDatasetRequest request,
                                            Authentication authentication);

    PageResponse<ExportJobResponse> getMyExportJobs(String status,
                                                    String exportType,
                                                    int page,
                                                    int size,
                                                    Authentication authentication);

    ExportJobResponse getExportJobById(UUID exportId, Authentication authentication);

    ExportDownloadResponse downloadExport(UUID exportId, Authentication authentication);

    ResponseEntity<Resource> downloadExportFile(UUID exportId, Authentication authentication);

    ExportJobResponse retryExport(UUID exportId, Authentication authentication);

    void deleteExport(UUID exportId, Authentication authentication);
}
