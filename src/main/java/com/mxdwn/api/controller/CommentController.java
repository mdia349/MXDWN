package com.mxdwn.api.controller;

import com.mxdwn.api.dto.request.CommentRequestDTO;
import com.mxdwn.api.dto.response.CommentResponseDTO;
import com.mxdwn.api.entity.Comment;
import com.mxdwn.api.mapper.MxdwnMapper;
import com.mxdwn.api.repository.CommentRepository;
import com.mxdwn.api.repository.MixRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mixes/{mixId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final MixRepository mixRepository;
    private final MxdwnMapper mxdwnMapper;

    @GetMapping
    public List<CommentResponseDTO> getCommentsForMix(@PathVariable UUID mixId) {
        return commentRepository.findAllByMixIdOrderByTimestampMsAsc(mixId).stream()
                .map(mxdwnMapper::toDto)
                .toList();
    }


    @PostMapping
    public CommentResponseDTO addComment(@PathVariable UUID mixId, @RequestBody CommentRequestDTO commentRequest) {
        return mixRepository.findById(mixId).map(mix -> {
            Comment commentToSave = mxdwnMapper.toEntity(commentRequest);
            commentToSave.setMix(mix);
            Comment savedComment = commentRepository.save(commentToSave);
            return mxdwnMapper.toDto(savedComment);
        }).orElseThrow(() -> new RuntimeException("Mix not found with ID: " + mixId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        commentRepository.deleteById(commentId);
        return ResponseEntity.noContent().build();
    }
}
