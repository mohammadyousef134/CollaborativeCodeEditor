package com.example.collaborative_code_editor.controller;

import com.example.collaborative_code_editor.DTO.ExecuteRequest;
import com.example.collaborative_code_editor.DTO.ExecutionResult;
import com.example.collaborative_code_editor.security.SecurityUtils;
import com.example.collaborative_code_editor.service.ExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/repos/{repoId}/nodes/{fileId}/execute")
public class ExecutionController {

    @Autowired
    private ExecutionService service;

    @PostMapping
    public ExecutionResult execute(@PathVariable Long repoId, @PathVariable Long fileId,
                                   @RequestBody(required = false) ExecuteRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.execute(repoId, fileId, userId, (request == null ? null : request.getStdin()));
    }
}