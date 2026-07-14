package com.t7.seal.config;

import io.swagger.v3.core.jackson.ModelResolver;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "SEAL Hackathon API",
                version = "v1",
                description = "REST API for hackathon access, teams, submissions, grading, results, notifications, exports, and AI assistance.",
                contact = @Contact(name = "SEAL Engineering Team"),
                license = @License(name = "Project license")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local development")
        },
        tags = {
                @Tag(name = "Authentication", description = "Registration, login, verification, and password recovery"),
                @Tag(name = "Users", description = "Profiles and user administration"),
                @Tag(name = "Events", description = "Event lifecycle and public discovery"),
                @Tag(name = "Tracks", description = "Competition tracks and mentor assignments"),
                @Tag(name = "Rounds", description = "Round lifecycle, locking, and advancement"),
                @Tag(name = "Criteria", description = "Scoring criteria and event overrides"),
                @Tag(name = "Teams", description = "Team formation, invitations, join requests, and registration"),
                @Tag(name = "Submissions", description = "Deliverables, links, files, and repository metadata"),
                @Tag(name = "Grading", description = "Judge assignment, scoring, calibration, and progress"),
                @Tag(name = "Results", description = "Ranking, advancement, disqualification, prizes, and publication"),
                @Tag(name = "Notifications", description = "Announcements, notifications, reminders, and email delivery"),
                @Tag(name = "Exports", description = "Export job creation, status, and downloads"),
                @Tag(name = "Audit", description = "Append-only audit history"),
                @Tag(name = "AI Assistant", description = "Assistant chat, RAG knowledge, and safety administration"),
                @Tag(name = "System", description = "System configuration and health")
        }
)
@SecurityScheme(
        name = OpenApiConfig.BEARER_AUTH,
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT access token returned by POST /api/v1/auth/login"
)
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    static {
        ModelResolver.enumsAsRef = true;
    }
}
