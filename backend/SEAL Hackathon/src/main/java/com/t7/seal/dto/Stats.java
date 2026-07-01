package com.t7.seal.dto;

public record Stats(
        Double mean,
        Double variance,
        Double standardDeviation,
        Double min,
        Double max
) {}
