package com.mxdwn.api.mapper;

import com.mxdwn.api.dto.request.CommentRequestDTO;
import com.mxdwn.api.dto.request.MixRequestDTO;
import com.mxdwn.api.dto.request.ProjectRequestDTO;
import com.mxdwn.api.dto.response.CommentResponseDTO;
import com.mxdwn.api.dto.response.MixResponseDTO;
import com.mxdwn.api.dto.response.ProjectResponseDTO;
import com.mxdwn.api.entity.Comment;
import com.mxdwn.api.entity.Mix;
import com.mxdwn.api.entity.Project;
import org.springframework.stereotype.Component;

@Component
public class MxdwnMapper {

    // CONVERT TO DTO
    public ProjectResponseDTO toDto(Project project) {
        if (project == null) return null;

        return ProjectResponseDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .artistId(project.getArtistId())
                .createdAt(project.getCreatedAt())
                .build();
    }

    public MixResponseDTO toDto(Mix mix) {
        if (mix == null) return null;

        return MixResponseDTO.builder()
                .id(mix.getId())
                .projectId(mix.getProject().getId())
                .versionName(mix.getVersionName())
                .durationMs(mix.getDurationMs())
                .uploadedAt(mix.getUploadedAt())
                // .streamUrl()
                .build();
    }

    public CommentResponseDTO toDto(Comment comment) {
        if (comment == null) return null;

        return CommentResponseDTO.builder()
                .id(comment.getId())
                .mixId(comment.getMix().getId())
                .userId(comment.getUserId())
                .timestampMs(comment.getTimestampMs())
                .text(comment.getText())
                .isResolved(comment.isResolved())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    // CONVERT TO ENTITY
    public Project toEntity(ProjectRequestDTO dto) {
        return Project.builder()
                .title(dto.title())
                .artistId(dto.artistId())
                .build();
    }

    public Mix toEntity(MixRequestDTO dto) {
        return Mix.builder()
                .versionName(dto.versionName())
                .fileFormat(dto.fileFormat())
                .durationMs(dto.durationMs())
                .s3ObjectKey(dto.s3ObjectKey())
                .build();
    }

    public Comment toEntity(CommentRequestDTO dto) {
        return Comment.builder()
                .userId(dto.userId())
                .timestampMs(dto.timestampMs())
                .text(dto.text())
                .isResolved(false)
                .build();
    }
}
