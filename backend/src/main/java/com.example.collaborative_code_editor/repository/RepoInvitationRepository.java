package com.example.collaborative_code_editor.repository;

import com.example.collaborative_code_editor.entity.RepoInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepoInvitationRepository extends JpaRepository<RepoInvitation, Long> {
    List<RepoInvitation> findByUserIdAndStatus(Long userId, String status);
    List<RepoInvitation> findByRepoId(Long repoId);
    boolean existsByRepoIdAndUserIdAndStatus(Long repoId, Long userId, String status);
}