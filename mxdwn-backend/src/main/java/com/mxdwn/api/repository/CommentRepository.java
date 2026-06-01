package com.mxdwn.api.repository;

import com.mxdwn.api.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findAllByMixIdOrderByTimestampMsAsc(UUID mixId);
}
