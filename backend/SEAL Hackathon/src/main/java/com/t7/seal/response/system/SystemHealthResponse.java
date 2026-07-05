package com.t7.seal.response.system;

import java.util.Map;

public record SystemHealthResponse(
        String status,
        boolean databaseUp,
        boolean mailUp,
        boolean storageUp,
        Map<String, Object> details
) {}
