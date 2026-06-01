package com.mxdwn.api.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ProjectResponseDTO(
        UUID id,
        String title,
        String artistId,
        LocalDateTime createdAt
) {}
