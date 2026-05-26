package com.mxdwn.api.dto.request;

public record MixRequestDTO(
        String versionName,
        String fileFormat,
        Long durationMs,
        String s3ObjectKey
) {}
