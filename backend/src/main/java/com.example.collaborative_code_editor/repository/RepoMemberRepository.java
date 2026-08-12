package com.example.collaborative_code_editor.repository;

import com.example.collaborative_code_editor.entity.RepoMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepoMemberRepository extends JpaRepository<RepoMember, Long> {
    List<RepoMember> findByUserId(Long userId);
    List<RepoMember> findByRepoId(Long repoId);
    boolean existsByRepoIdAndUserId(Long repoId, Long userId);
    Optional<RepoMember> findByRepoIdAndUserId(Long repoId, Long userId);
}
