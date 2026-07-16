package com.t7.seal.service;

import com.t7.seal.config.SubmissionProperties;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.entities.SubmissionLink;
import com.t7.seal.response.submission.SubmissionProviderAvailabilityResponse;
import com.t7.seal.response.submission.SubmissionRequirementItemResponse;
import com.t7.seal.response.submission.SubmissionUploadPolicyResponse;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SubmissionRequirementCatalogTest {

    private final SubmissionProperties properties = new SubmissionProperties();
    private final SubmissionRequirementCatalog catalog = new SubmissionRequirementCatalog(properties);

    @Test
    void evaluatesAllTypesAndPersistedLinksInStableOrder() {
        UUID repositoryLinkId = UUID.randomUUID();
        UUID otherLinkId = UUID.randomUUID();
        List<SubmissionLink> links = List.of(
                SubmissionLink.builder()
                        .id(repositoryLinkId)
                        .linkType(SubmissionLinkType.REPOSITORY)
                        .build(),
                SubmissionLink.builder()
                        .id(otherLinkId)
                        .linkType(SubmissionLinkType.OTHER)
                        .build()
        );

        SubmissionRequirementCatalog.Evaluation result = catalog.evaluate(
                List.of(SubmissionLinkType.DEMO, SubmissionLinkType.REPOSITORY, SubmissionLinkType.DEMO),
                links
        );

        assertEquals(6, result.requirements().size());
        assertEquals(
                List.of("REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"),
                result.requirements().stream().map(SubmissionRequirementItemResponse::type).toList()
        );
        assertEquals(List.of("REPOSITORY", "OTHER"), result.satisfiedTypes());
        assertEquals(List.of("DEMO"), result.missingRequiredTypes());

        SubmissionRequirementItemResponse repository = requirement(result, "REPOSITORY");
        assertTrue(repository.required());
        assertTrue(repository.satisfied());
        assertEquals(List.of(repositoryLinkId), repository.satisfiedByLinkIds());
        assertTrue(repository.allowedSources().contains("GITHUB"));
        assertEquals(1, repository.displayOrder());

        SubmissionRequirementItemResponse demo = requirement(result, "DEMO");
        assertTrue(demo.required());
        assertTrue(demo.primary());
        assertFalse(demo.satisfied());
        assertFalse(demo.allowedSources().contains("GITHUB"));
        assertEquals(2, demo.displayOrder());
    }

    @Test
    void exposesConfiguredUploadPolicyAndNeverFakesUnavailableIntegrations() {
        properties.getUpload().setMaxSizeMb(2);
        properties.getUpload().setMaxFiles(3);
        properties.getUpload().setAllowedContentTypes(List.of("application/pdf"));
        properties.getUpload().setAllowedExtensions(List.of(".pdf"));
        properties.getProviders().getLocalFile().setEnabled(true);
        properties.getProviders().getGoogleDrive().setEnabled(true);

        SubmissionUploadPolicyResponse uploadPolicy = catalog.uploadPolicy();
        assertEquals(2L * 1024L * 1024L, uploadPolicy.maximumFileSizeBytes());
        assertEquals(3, uploadPolicy.maximumFiles());
        assertEquals(List.of("application/pdf"), uploadPolicy.acceptedMimeTypes());
        assertEquals(List.of(".pdf"), uploadPolicy.acceptedExtensions());

        List<SubmissionProviderAvailabilityResponse> providers = catalog.providerAvailability();
        assertTrue(provider(providers, "URL").available());
        assertTrue(provider(providers, "LOCAL_FILE").available());
        assertFalse(provider(providers, "GOOGLE_DRIVE").available());
        assertTrue(provider(providers, "GOOGLE_DRIVE").message().contains("not available in this build"));
        assertFalse(provider(providers, "GITHUB").available());
    }

    private SubmissionRequirementItemResponse requirement(
            SubmissionRequirementCatalog.Evaluation evaluation,
            String type
    ) {
        return evaluation.requirements().stream()
                .filter(item -> item.type().equals(type))
                .findFirst()
                .orElseThrow();
    }

    private SubmissionProviderAvailabilityResponse provider(
            List<SubmissionProviderAvailabilityResponse> providers,
            String source
    ) {
        return providers.stream()
                .filter(provider -> provider.source().equals(source))
                .findFirst()
                .orElseThrow();
    }
}
