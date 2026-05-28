package com.mxdwn.api.controller;

import com.mxdwn.api.dto.request.ProjectRequestDTO;
import com.mxdwn.api.dto.response.ProjectResponseDTO;
import com.mxdwn.api.entity.Project;
import com.mxdwn.api.mapper.MxdwnMapper;
import com.mxdwn.api.repository.ProjectRepository;
import com.mxdwn.api.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final MxdwnMapper mxdwnMapper;
    private final S3Service s3Service;

    @GetMapping
    public List<ProjectResponseDTO> getProjectByArtist(@RequestParam String artistId) {
        return projectRepository.findAllByArtistId(artistId).stream()
                .map(mxdwnMapper::toDto)
                .toList();
    }

    @PostMapping
    ProjectResponseDTO createProject(@RequestBody ProjectRequestDTO projectRequest) {
        Project projectToSave = mxdwnMapper.toEntity(projectRequest);
        Project savedProject = projectRepository.save(projectToSave);
        return mxdwnMapper.toDto(savedProject);
    }

    @Transactional
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID projectId) {
        projectRepository.findById(projectId).ifPresent(project -> {
            project.getMixes().forEach(mix -> s3Service.deleteFile(mix.getS3ObjectKey()));
            projectRepository.delete(project);
        });
        return ResponseEntity.noContent().build();
    }
}
