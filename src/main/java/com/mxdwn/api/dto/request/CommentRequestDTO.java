package com.mxdwn.api.dto.request;

import jakarta.validation.constraints.*;

public record CommentRequestDTO(
        @NotBlank(message = "User ID cannot be empty")
        String userId,

        @NotNull(message = "Timestamp is required")
        @PositiveOrZero(message = "Timestamp cannot be negative")
        Long timestampMs,

        @NotBlank(message = "Comment cannot be empty")
        @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
        String text
) {}
