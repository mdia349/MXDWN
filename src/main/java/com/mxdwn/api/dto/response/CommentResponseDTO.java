package com.mxdwn.api.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record CommentResponseDTO(
        UUID id,
        UUID mixId,
        String userId,
        Long timestampMs,
        String text,
        boolean isResolved,
        LocalDateTime createdAt
) {}
