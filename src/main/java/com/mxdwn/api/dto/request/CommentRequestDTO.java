package com.mxdwn.api.dto.request;

public record CommentRequestDTO(
        String userId,
        Long timestampMs,
        String text
) {}
