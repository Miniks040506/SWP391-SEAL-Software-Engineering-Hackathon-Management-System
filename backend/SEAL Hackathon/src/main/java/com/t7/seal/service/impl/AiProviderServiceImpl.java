package com.t7.seal.service.impl;

import com.t7.seal.dto.ai.AiProviderRequest;
import com.t7.seal.dto.ai.AiProviderResult;
import com.t7.seal.service.AiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiProviderServiceImpl implements AiProviderService {
    @Override
    public AiProviderResult generate(AiProviderRequest request) {
        return null;
    }
}
