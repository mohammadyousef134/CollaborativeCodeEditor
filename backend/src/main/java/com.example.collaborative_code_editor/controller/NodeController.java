package com.example.collaborative_code_editor.controller;

import com.example.collaborative_code_editor.DTO.CreateFileRequest;
import com.example.collaborative_code_editor.DTO.UpdateFileRequest;
import com.example.collaborative_code_editor.entity.Node;
import com.example.collaborative_code_editor.security.SecurityUtils;
import com.example.collaborative_code_editor.service.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repos/{repoId}/nodes")
public class NodeController {

    @Autowired
    private NodeService service;

    @GetMapping
    public List<Node> getFiles(@PathVariable Long repoId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getNodes(repoId, userId);
    }

    @PostMapping
    public Node createNewFile(@PathVariable Long repoId, @RequestBody CreateFileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.createFile(
                repoId,
                userId,
                request.getName(),
                request.getLanguage()
        );
    }

    @PutMapping("/{fileId}")
    public Node updateFile(@PathVariable Long repoId, @PathVariable Long fileId, @RequestBody UpdateFileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.updateFile(repoId, fileId, userId, request.getContent());
    }

    @DeleteMapping("/{fileId}")
    public void deleteFile(@PathVariable Long repoId, @PathVariable Long fileId) {
        Long userId = SecurityUtils.getCurrentUserId();
        service.deleteFile(repoId, fileId, userId);
    }
    
    @GetMapping("/{fileId}")
    public Node getFile(
            @PathVariable Long repoId,
            @PathVariable Long fileId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getFile(repoId, fileId, userId);
    }

}
