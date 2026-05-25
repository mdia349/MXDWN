package com.mxdwn.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mix_id", nullable = false)
    @ToString.Exclude
    private Mix mix;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "timestamp_ms", nullable = false)
    private Long timestampMs;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(name = "is_resolved")
    private boolean isResolved = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}
