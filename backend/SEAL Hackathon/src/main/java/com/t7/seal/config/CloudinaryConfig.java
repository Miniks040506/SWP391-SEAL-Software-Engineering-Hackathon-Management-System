package com.t7.seal.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CloudinaryProperties.class)
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(CloudinaryProperties cloudinaryProperties) {
        return new Cloudinary(
                ObjectUtils.asMap(
                        "cloud_name", cloudinaryProperties.cloudName(),
                        "api_key", cloudinaryProperties.apiKey(),
                        "api_secret", cloudinaryProperties.apiSecret(),
                        "secure", true
                )
        );
    }
}
