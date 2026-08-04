package com.example.collaborative_code_editor.controller;

import com.example.collaborative_code_editor.DTO.CreateRepoRequest;
import com.example.collaborative_code_editor.DTO.InviteUserToRepoRequest;
import com.example.collaborative_code_editor.entity.Repo;
import com.example.collaborative_code_editor.security.SecurityUtils;
import com.example.collaborative_code_editor.service.RepoService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/repo")
public class RepoController {
    private final RepoService service;

    public RepoController(RepoService service) {
        this.service = service;
    }

    @PostMapping
    public void createRepo(@RequestBody CreateRepoRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        service.createRepo(request.getName(), userId);
    }

    @GetMapping
    public List<Repo> getMyRepos() {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getMyRepos(userId);
    }

    @DeleteMapping("/{repoId}")
    public void deleteRepo(@PathVariable Long repoId) {
        Long userId = SecurityUtils.getCurrentUserId();
        service.DeleteRepo(repoId, userId);
    }

    @PostMapping("/{repoId}/invite")
    public void inviteUser(
            @PathVariable Long repoId,
            @RequestBody InviteUserToRepoRequest request
            ) {
        Long userId = SecurityUtils.getCurrentUserId();

        service.inviteUser(repoId, userId, request.getEmail());
    }



}
