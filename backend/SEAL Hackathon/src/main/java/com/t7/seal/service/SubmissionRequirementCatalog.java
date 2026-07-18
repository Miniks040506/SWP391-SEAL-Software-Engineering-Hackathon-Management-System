package com.t7.seal.service;

import com.t7.seal.config.SubmissionProperties;
import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.domain.SubmissionInputSource;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.entities.SubmissionLink;
import com.t7.seal.response.submission.SubmissionProviderAvailabilityResponse;
import com.t7.seal.response.submission.SubmissionRequirementItemResponse;
import com.t7.seal.response.submission.SubmissionUploadPolicyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SubmissionRequirementCatalog {

    private final SubmissionProperties properties;
    private final ProviderOAuthProperties providerOAuthProperties;

    public Evaluation evaluate(
            Collection<SubmissionLinkType> configuredRequiredTypes,
            Collection<SubmissionLink> currentLinks
    ) {
        List<SubmissionLinkType> requiredTypes = configuredRequiredTypes == null
                ? List.of()
                : configuredRequiredTypes.stream().filter(Objects::nonNull).distinct().toList();
        Collection<SubmissionLink> links = currentLinks == null ? List.of() : currentLinks;

        Map<SubmissionLinkType, List<UUID>> satisfyingLinkIds = links.stream()
                .filter(link -> link.getLinkType() != null)
                .collect(Collectors.groupingBy(
                        SubmissionLink::getLinkType,
                        () -> new EnumMap<>(SubmissionLinkType.class),
                        Collectors.mapping(
                                SubmissionLink::getId,
                                Collectors.filtering(Objects::nonNull, Collectors.toList())
                        )
                ));

        SubmissionLinkType primaryType = requiredTypes.stream()
                .findFirst()
                .orElse(SubmissionLinkType.REPOSITORY);
        List<SubmissionRequirementItemResponse> requirements = Arrays.stream(SubmissionLinkType.values())
                .map(type -> new SubmissionRequirementItemResponse(
                        type.name(),
                        label(type),
                        requiredTypes.contains(type),
                        allowedSources(type),
                        type == primaryType,
                        type.ordinal() + 1,
                        satisfyingLinkIds.containsKey(type),
                        List.copyOf(satisfyingLinkIds.getOrDefault(type, List.of()))
                ))
                .toList();
        List<String> satisfiedTypes = Arrays.stream(SubmissionLinkType.values())
                .filter(satisfyingLinkIds::containsKey)
                .map(Enum::name)
                .toList();
        List<String> missingRequiredTypes = requiredTypes.stream()
                .filter(type -> !satisfyingLinkIds.containsKey(type))
                .map(Enum::name)
                .toList();

        return new Evaluation(requirements, satisfiedTypes, missingRequiredTypes);
    }

    public SubmissionUploadPolicyResponse uploadPolicy() {
        SubmissionProperties.Upload upload = properties.getUpload();
        return new SubmissionUploadPolicyResponse(
                List.copyOf(upload.getAllowedContentTypes()),
                List.copyOf(upload.getAllowedExtensions()),
                upload.getMaxSizeBytes(),
                upload.getMaxFiles()
        );
    }

    public List<SubmissionProviderAvailabilityResponse> providerAvailability() {
        SubmissionProperties.Providers providers = properties.getProviders();
        SubmissionProperties.ProviderAvailability localFile = providers.getLocalFile();
        boolean localFileAvailable = localFile.isEnabled()
                && "AWS_S3".equalsIgnoreCase(properties.getStorage().getProvider());

        return List.of(
                new SubmissionProviderAvailabilityResponse(
                        SubmissionInputSource.URL.name(), true,
                        "External HTTP and HTTPS URLs are available."
                ),
                new SubmissionProviderAvailabilityResponse(
                        SubmissionInputSource.LOCAL_FILE.name(), localFileAvailable,
                        localFileAvailable ? "Local file upload is available."
                                : localFile.getUnavailableMessage()
                ),
                googleDriveAvailability(providers.getGoogleDrive()),
                githubAvailability(providers.getGithub())
        );
    }

    public boolean supportsSource(
            SubmissionLinkType type,
            SubmissionInputSource source
    ) {
        return type != null
                && source != null
                && allowedSources(type).contains(source.name());
    }

    private SubmissionProviderAvailabilityResponse googleDriveAvailability(
            SubmissionProperties.ProviderAvailability configuration
    ) {
        if (!configuration.isEnabled()) {
            return new SubmissionProviderAvailabilityResponse(
                    SubmissionInputSource.GOOGLE_DRIVE.name(),
                    false,
                    configuration.getUnavailableMessage()
            );
        }

        boolean available = providerOAuthProperties.isGoogleDriveConfigured();
        return new SubmissionProviderAvailabilityResponse(
                SubmissionInputSource.GOOGLE_DRIVE.name(),
                available,
                available
                        ? "Google Drive file selection and snapshot import are available."
                        : providerOAuthProperties.googleDriveConfigurationMessage()
        );
    }

    private SubmissionProviderAvailabilityResponse githubAvailability(
            SubmissionProperties.ProviderAvailability configuration
    ) {
        if (!configuration.isEnabled()) {
            return new SubmissionProviderAvailabilityResponse(
                    SubmissionInputSource.GITHUB.name(),
                    false,
                    configuration.getUnavailableMessage()
            );
        }

        boolean available = providerOAuthProperties.isGithubConfigured();
        return new SubmissionProviderAvailabilityResponse(
                SubmissionInputSource.GITHUB.name(),
                available,
                available
                        ? "GitHub repository selection and commit snapshots are available."
                        : providerOAuthProperties.githubConfigurationMessage()
        );
    }

    private List<String> allowedSources(SubmissionLinkType type) {
        if (type == SubmissionLinkType.REPOSITORY) {
            return List.of("URL", "LOCAL_FILE", "GOOGLE_DRIVE", "GITHUB");
        }
        return List.of("URL", "LOCAL_FILE", "GOOGLE_DRIVE");
    }

    private String label(SubmissionLinkType type) {
        return switch (type) {
            case REPOSITORY -> "Source repository";
            case DEMO -> "Product demo";
            case SLIDE -> "Presentation slides";
            case REPORT -> "Project report";
            case VIDEO -> "Demo video";
            case OTHER -> "Other supporting evidence";
        };
    }

    public record Evaluation(
            List<SubmissionRequirementItemResponse> requirements,
            List<String> satisfiedTypes,
            List<String> missingRequiredTypes
    ) {
    }
}
