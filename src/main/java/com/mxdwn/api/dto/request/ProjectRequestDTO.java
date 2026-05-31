package com.mxdwn.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ProjectRequestDTO(
        @NotBlank(message = "Project title cannot be empty")
        String title,
        @NotBlank(message = "Artist ID cannot be empty")
        String artistId
) {}
