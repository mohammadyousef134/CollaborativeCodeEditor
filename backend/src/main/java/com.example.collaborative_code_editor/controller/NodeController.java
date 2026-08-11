package com.example.collaborative_code_editor.controller;

import com.example.collaborative_code_editor.DTO.*;
import com.example.collaborative_code_editor.security.SecurityUtils;
import com.example.collaborative_code_editor.service.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repos/{repoId}/nodes")
public class NodeController {

    @Autowired
    private NodeService service;

    @GetMapping
    public List<NodeResponse> getNodes(@PathVariable Long repoId,
                                       @RequestParam(required = false) Long folderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getNodes(repoId, folderId, userId);
    }

    @PostMapping
    public NodeResponse createNode(@PathVariable Long repoId, @RequestBody CreateFileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.createNode(repoId, userId, request.getName(), request.getLanguage(), request.getType(), request.getParentId());

    }

    @PatchMapping("/{nodeId}/rename")
    public NodeResponse renameNode(@PathVariable Long repoId, @PathVariable Long nodeId, @RequestBody RenameNodeRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.renameNode(repoId, nodeId, userId, request.getName());
    }

    @PatchMapping("/{nodeId}/move")
    public NodeResponse moveNode(@PathVariable Long repoId, @PathVariable Long nodeId, @RequestBody MoveNodeRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.moveNode(repoId, nodeId, userId, request.getParentId());
    }

    @GetMapping("/{fileId}")
    public FileContentResponse getFile(
            @PathVariable Long repoId,
            @PathVariable Long fileId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getFile(repoId, fileId, userId);
    }

    @PutMapping("/{fileId}")
    public NodeResponse updateFile(@PathVariable Long repoId, @PathVariable Long fileId, @RequestBody UpdateFileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.updateFile(repoId, fileId, userId, request.getContent());
    }

    @DeleteMapping("/{fileId}")
    public void deleteFile(@PathVariable Long repoId, @PathVariable Long fileId) {
        Long userId = SecurityUtils.getCurrentUserId();
        service.deleteNode(repoId, fileId, userId);
    }

    @GetMapping("/{nodeId}/info")
    public NodeResponse getNode(@PathVariable Long repoId, @PathVariable Long nodeId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getNode(repoId, nodeId, userId);
    }


}
