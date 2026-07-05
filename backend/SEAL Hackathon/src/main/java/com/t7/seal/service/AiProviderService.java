package com.t7.seal.service;

import com.t7.seal.dto.ai.AiProviderRequest;
import com.t7.seal.dto.ai.AiProviderResult;

public interface AiProviderService {

    AiProviderResult generate(AiProviderRequest request);
}
