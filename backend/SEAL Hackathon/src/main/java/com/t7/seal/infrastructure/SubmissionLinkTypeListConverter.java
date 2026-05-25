package com.t7.seal.infrastructure;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.SubmissionLinkType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Converter
public class SubmissionLinkTypeListConverter
        implements AttributeConverter<List<SubmissionLinkType>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<SubmissionLinkType> submissionLinkTypes) {
        try {
            if(submissionLinkTypes == null || submissionLinkTypes.isEmpty()) {
                return null;
            }
            return objectMapper.writeValueAsString(submissionLinkTypes);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot convert RequireLinkType to JSON", e);
        }
    }

    @Override
    public List<SubmissionLinkType> convertToEntityAttribute(String s) {
        try {
            if(s == null  || s.isBlank()){
                return new ArrayList<>();
            }

            return objectMapper.readValue(
                s, new TypeReference<List<SubmissionLinkType>>() {}
            );

        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot convert JSON to RequireLinkType", e);
        }

    }
}
