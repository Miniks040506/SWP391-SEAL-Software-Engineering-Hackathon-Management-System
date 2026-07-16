package com.t7.seal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.submission")
@Getter
@Setter
public class SubmissionProperties {

    private Storage storage = new Storage();
    private Upload upload = new Upload();
    private Providers providers = new Providers();

    @Getter
    @Setter
    public static class Storage {
        private String provider = "AWS_S3";
    }

    @Getter
    @Setter
    public static class Upload {
        private long maxSizeMb = 25;
        private int maxFiles = 10;
        private List<String> allowedContentTypes = new ArrayList<>(List.of(
                "application/pdf",
                "application/zip",
                "application/x-zip-compressed",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "video/mp4",
                "image/png",
                "image/jpeg",
                "text/plain"
        ));
        private List<String> allowedExtensions = new ArrayList<>(List.of(
                ".pdf", ".zip", ".ppt", ".pptx", ".mp4", ".png", ".jpg", ".jpeg", ".txt"
        ));

        public long getMaxSizeBytes() {
            return maxSizeMb * 1024L * 1024L;
        }
    }

    @Getter
    @Setter
    public static class Providers {
        private ProviderAvailability localFile = new ProviderAvailability();
        private ProviderAvailability googleDrive = new ProviderAvailability();
        private ProviderAvailability github = new ProviderAvailability();
    }

    @Getter
    @Setter
    public static class ProviderAvailability {
        private boolean enabled;
        private String unavailableMessage = "This submission source is not configured.";
    }
}
