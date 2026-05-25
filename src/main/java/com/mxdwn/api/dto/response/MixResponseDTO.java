package com.mxdwn.api.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record MixResponseDTO(
        UUID id,
        UUID projectId,
        String versionName,
        Long durationMs,
        String streamURL,
        LocalDateTime uploadedAt
) {}
