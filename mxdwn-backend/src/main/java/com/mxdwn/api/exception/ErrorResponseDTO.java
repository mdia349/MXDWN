package com.mxdwn.api.exception;

import lombok.Builder;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.time.LocalDateTime;

@Builder
public record ErrorResponseDTO(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {}
