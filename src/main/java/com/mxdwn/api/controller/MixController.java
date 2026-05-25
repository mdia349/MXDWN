package com.mxdwn.api.controller;

import com.mxdwn.api.dto.request.MixRequestDTO;
import com.mxdwn.api.dto.response.MixResponseDTO;
import com.mxdwn.api.entity.Mix;
import com.mxdwn.api.mapper.MxdwnMapper;
import com.mxdwn.api.repository.MixRepository;
import com.mxdwn.api.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/mixes")
@RequiredArgsConstructor
public class MixController {

    private final MixRepository mixRepository;
    private final ProjectRepository projectRepository;
    private final MxdwnMapper mxdwnMapper;

    @GetMapping
    public List<MixResponseDTO> getMixesForProject(@PathVariable UUID projectId) {
        return mixRepository.findAllByProjectIdOrderByUploadedAtDesc(projectId).stream()
                .map(mxdwnMapper::toDto)
                .toList();
    }

    @PostMapping
    public MixResponseDTO createMix(@PathVariable UUID projectId, @RequestBody MixRequestDTO mixRequest) {
        return projectRepository.findById(projectId).map(project -> {
            Mix mixToSave = mxdwnMapper.toEntity(mixRequest);
            mixToSave.setProject(project);
            Mix savedMix = mixRepository.save(mixToSave);
            return mxdwnMapper.toDto(savedMix);
        }).orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
    }
}
