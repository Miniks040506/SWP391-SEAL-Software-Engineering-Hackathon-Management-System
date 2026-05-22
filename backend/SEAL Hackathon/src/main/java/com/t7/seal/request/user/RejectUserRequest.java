package com.t7.seal.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectUserRequest(@NotBlank @Size(max = 500) String reason) {}
