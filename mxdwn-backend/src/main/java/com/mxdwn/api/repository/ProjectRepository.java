package com.mxdwn.api.repository;

import com.mxdwn.api.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findAllByArtistId(String artistId);
}
