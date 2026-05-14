package com.t7.seal.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Getter
public class JwtConstant {

    private String secret = "gfghsgkjhfdshjtkusghjfhkfgsdjthsjrgshgrshghgdfhatrhr";

    private String header = "Authorization";
}
