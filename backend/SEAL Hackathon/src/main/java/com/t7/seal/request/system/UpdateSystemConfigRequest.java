package com.t7.seal.request.system;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record UpdateSystemConfigRequest(@NotEmpty List<SystemConfigItemRequest> items) {}