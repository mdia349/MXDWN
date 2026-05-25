package com.mxdwn.api.repository;

import com.mxdwn.api.entity.Mix;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MixRepository extends JpaRepository<Mix, UUID> {
    List<Mix> findAllByProjectIdOrderByUploadedAtDesc(UUID projectId);
}
