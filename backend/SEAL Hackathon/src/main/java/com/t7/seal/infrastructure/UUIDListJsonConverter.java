package com.t7.seal.infrastructure;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

@Converter
public class UUIDListJsonConverter implements AttributeConverter<List<UUID>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<UUID> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot convert UUID list to JSON", e);
        }
    }

    @Override
    public List<UUID> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(dbData, new TypeReference<List<UUID>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot convert JSON to UUID list", e);
        }
    }
}