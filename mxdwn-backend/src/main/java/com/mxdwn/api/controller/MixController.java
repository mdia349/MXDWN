package com.mxdwn.api.controller;

import com.mxdwn.api.dto.request.MixRequestDTO;
import com.mxdwn.api.dto.response.MixResponseDTO;
import com.mxdwn.api.entity.Mix;
import com.mxdwn.api.mapper.MxdwnMapper;
import com.mxdwn.api.repository.MixRepository;
import com.mxdwn.api.repository.ProjectRepository;
import com.mxdwn.api.service.S3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/mixes")
@RequiredArgsConstructor
public class MixController {

    private final MixRepository mixRepository;
    private final ProjectRepository projectRepository;
    private final MxdwnMapper mxdwnMapper;
    private final S3Service s3Service;

    @GetMapping
    public List<MixResponseDTO> getMixesForProject(@PathVariable UUID projectId) {
        return mixRepository.findAllByProjectIdOrderByUploadedAtDesc(projectId).stream()
                .map(mxdwnMapper::toDto)
                .toList();
    }

    @GetMapping("/upload-url")
    public Map<String, String> getUploadUrl(
            @PathVariable UUID projectId,
            @RequestParam String filename,
            @RequestParam String contentType) {
        String objectKey = "projects/" + projectId.toString() + "/" + UUID.randomUUID() + "_" + filename;

        String uploadUrl = s3Service.generateUploadUrl(objectKey, contentType);

        return Map.of(
                "uploadUrl", uploadUrl,
                "s3ObjectKey", objectKey
        );
    }


    @PostMapping
    public MixResponseDTO createMix(
            @PathVariable UUID projectId,
            @Valid @RequestBody MixRequestDTO mixRequest) {
        return projectRepository.findById(projectId).map(project -> {
            Mix mixToSave = mxdwnMapper.toEntity(mixRequest);
            mixToSave.setProject(project);
            Mix savedMix = mixRepository.save(mixToSave);
            return mxdwnMapper.toDto(savedMix);
        }).orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
    }

    @DeleteMapping("/{mixId}")
    public ResponseEntity<Void> deleteMix(@PathVariable UUID mixId) {
        mixRepository.findById(mixId).ifPresent(mix -> {
            s3Service.deleteFile(mix.getS3ObjectKey());
            mixRepository.delete(mix);
        });
        return ResponseEntity.noContent().build();
    }
}
