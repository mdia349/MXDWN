package com.mxdwn.api.controller;

import com.mxdwn.api.dto.request.ProjectRequestDTO;
import com.mxdwn.api.dto.response.ProjectResponseDTO;
import com.mxdwn.api.entity.Project;
import com.mxdwn.api.mapper.MxdwnMapper;
import com.mxdwn.api.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final MxdwnMapper mxdwnMapper;

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
}
