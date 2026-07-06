package com.t7.seal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "seal.ai")
@Getter
@Setter
public class AiProviderProperties {
    private boolean enabled = true;
    private String provider = "RULE_BASED";
    private Chat chat = new Chat();
    private Embedding embedding = new Embedding();
    private Rag rag = new Rag();
    private Guardrail guardrail = new Guardrail();

    @Getter
    @Setter
    public static class Chat {
        private String baseUrl = "https://api.openai.com/v1";
        private String apiKey = "";
        private String model = "gpt-4o-mini";
        private double temperature = 0.2;
        private int maxTokens = 1200;
        private int timeoutSeconds = 45;
    }

    @Getter
    @Setter
    public static class Embedding {
        private boolean enabled = true;
        private String baseUrl = "https://api.openai.com/v1";
        private String apiKey = "";
        private String model = "text-embedding-3-small";
        private int dimension = 1536;
        private int timeoutSeconds = 45;
        private double minScore = 0.55;
        private boolean pgvectorEnabled = true;
    }

    @Getter
    @Setter
    public static class Rag {
        private int maxChunks = 5;
        private int fallbackKeywordChunks = 3;
    }

    @Getter
    @Setter
    public static class Guardrail {
        private boolean strictForAllRoles = true;
        private boolean restrictToProjectScope = true;
        private String disclaimer = "SEAL Assistant can explain system usage, " +
                "translate Vietnamese/English, and guide debugging, " +
                "but it will not write hackathon solution code for participants.";
    }
}
