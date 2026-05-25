package com.t7.seal.service.impl;

import com.t7.seal.service.TokenGenerator;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class SecureTokenGenerator implements TokenGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String generateSixDigitCode() {
        int code = RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }
}
