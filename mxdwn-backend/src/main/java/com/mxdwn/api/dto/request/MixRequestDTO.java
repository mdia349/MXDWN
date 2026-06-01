package com.mxdwn.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MixRequestDTO(
        @NotBlank(message = "Version name cannot be empty")
        String versionName,

        @NotBlank(message = "File format must be specified")
        String fileFormat,

        @NotNull(message = "Duration is required")
        @Positive(message = "Duration must be greater than zero")
        Long durationMs,

        @NotBlank(message = "S3 Object Key is required to link the file")
        String s3ObjectKey
) {}
