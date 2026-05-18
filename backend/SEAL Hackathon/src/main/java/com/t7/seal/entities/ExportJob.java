package com.t7.seal.entities;

import com.t7.seal.domain.ExportJobStatus;
import com.t7.seal.domain.ExportType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
        name = "export_jobs",
        indexes = {
                @Index(name = "idx_export_job_requested_by", columnList = "requested_by"),
                @Index(name = "idx_export_job_export_type", columnList = "export_type"),
                @Index(name = "idx_export_job_status", columnList = "status"),
                @Index(name = "idx_export_job_requested_at", columnList = "requested_at"),
                @Index(name = "idx_export_job_completed_at", columnList = "completed_at"),
                @Index(name = "idx_export_job_expires_at", columnList = "expires_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "export_type", nullable = false, length = 100)
    private ExportType exportType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "params", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> params;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ExportJobStatus status = ExportJobStatus.QUEUED;

    // Download URL of the generated file.
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validateFileState();
        applyDefaults();
    }

    private void validateRequiredFields() {
        if (requestedBy == null) {
            throw new IllegalStateException("Requested by user is required.");
        }

        if (exportType == null) {
            throw new IllegalStateException("Export type is required.");
        }

        if (params == null || params.isEmpty()) {
            throw new IllegalStateException("Export parameters are required.");
        }
    }

    private void validateFileState() {
        if (fileSizeBytes != null && fileSizeBytes < 0) {
            throw new IllegalStateException("File size must be greater than or equal to 0.");
        }

        if (rowCount != null && rowCount < 0) {
            throw new IllegalStateException("Row count must be greater than or equal to 0.");
        }

        if (status == ExportJobStatus.DONE) {
            if (fileUrl == null || fileUrl.isBlank()) {
                throw new IllegalStateException("File URL is required when export job is DONE.");
            }

            if (fileName == null || fileName.isBlank()) {
                throw new IllegalStateException("File name is required when export job is DONE.");
            }
        }

        if (status == ExportJobStatus.FAILED) {
            if (errorMessage == null || errorMessage.isBlank()) {
                throw new IllegalStateException("Error message is required when export job is FAILED.");
            }
        }
    }

    private void applyDefaults() {
        if (status == null) {
            status = ExportJobStatus.QUEUED;
        }
    }

    // Helper methods


    // Checks whether this export job is waiting for processing.
    public boolean isQueued() {
        return status == ExportJobStatus.QUEUED;
    }


    // Checks whether this export job is currently processing.
    public boolean isProcessing() {
        return status == ExportJobStatus.PROCESSING;
    }


    // Checks whether this export job completed successfully.
    public boolean isDone() {
        return status == ExportJobStatus.DONE;
    }


    // Checks whether this export job failed.
    public boolean isFailed() {
        return status == ExportJobStatus.FAILED;
    }


    // Checks whether this export job is related to an anonymized RBL dataset.
    public boolean isAnonymizedScoreDataset() {
        return exportType == ExportType.SCORE_DATASET_ANONYMIZED;
    }


    // Checks whether this export job has a downloadable file.
    public boolean hasDownloadFile() {
        return fileUrl != null && !fileUrl.isBlank();
    }


    // Checks whether the exported file has expired.
    public boolean isExpired(LocalDateTime now) {
        return expiresAt != null && now != null && now.isAfter(expiresAt);
    }


    // Marks this export job as processing.
    public void markProcessing() {
        this.status = ExportJobStatus.PROCESSING;
        this.startedAt = LocalDateTime.now();
        this.errorMessage = null;
    }

    /**
     * Marks this export job as completed successfully.
     * The service layer should upload the generated file first,
     * then pass the final download URL and file metadata here.
     */
    public void markDone(
            String fileUrl,
            String fileName,
            Long fileSizeBytes,
            Integer rowCount,
            LocalDateTime expiresAt
    ) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("File URL is required.");
        }

        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name is required.");
        }

        this.status = ExportJobStatus.DONE;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSizeBytes = fileSizeBytes;
        this.rowCount = rowCount;
        this.completedAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.errorMessage = null;
    }


    // Marks this export job as failed.
    public void markFailed(String errorMessage) {
        if (errorMessage == null || errorMessage.isBlank()) {
            errorMessage = "Unknown export error.";
        }

        this.status = ExportJobStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = LocalDateTime.now();
    }


    // Returns a parameter value by key.
    public Object getParam(String key) {
        if (params == null || key == null) {
            return null;
        }

        return params.get(key);
    }

    // Returns a parameter value as String.
    public String getParamAsString(String key) {
        Object value = getParam(key);
        return value != null ? value.toString() : null;
    }

    // Checks whether the export should anonymize sensitive identifiers.
    public boolean shouldAnonymize() {
        Object value = getParam("anonymize");

        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }

        return value != null && Boolean.parseBoolean(value.toString());
    }
}
