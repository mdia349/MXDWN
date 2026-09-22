package com.mxdwn.api.controller;

import com.mxdwn.api.auth.entity.User;
import com.mxdwn.api.dto.request.ProjectRequestDTO;
import com.mxdwn.api.dto.response.ProjectResponseDTO;
import com.mxdwn.api.entity.Project;
import com.mxdwn.api.mapper.MxdwnMapper;
import com.mxdwn.api.repository.ProjectRepository;
import com.mxdwn.api.service.S3Service;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public List<ProjectResponseDTO> getProjects(
            @AuthenticationPrincipal User currentUser
            ) {
        return projectRepository.findAllByOwner_Id(currentUser.getId()).stream()
                .map(mxdwnMapper::toDto)
                .toList();
    }

    @PostMapping
    public ProjectResponseDTO createProject(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ProjectRequestDTO projectRequest
    ) {
        Project projectToSave = mxdwnMapper.toEntity(projectRequest);
        projectToSave.setOwner(currentUser);

        Project savedProject = projectRepository.save(projectToSave);
        return mxdwnMapper.toDto(savedProject);
    }

    @Transactional
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID projectId) {
        projectRepository.findById(projectId).ifPresent(project -> {
            s3Service.deleteFolder("projects/" + projectId.toString() + "/");
            projectRepository.delete(project);
        });
        return ResponseEntity.noContent().build();
    }
}
