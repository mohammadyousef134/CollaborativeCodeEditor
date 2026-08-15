package com.example.collaborative_code_editor.service;

import com.example.collaborative_code_editor.DTO.ExecutionResult;
import com.example.collaborative_code_editor.entity.Node;
import com.example.collaborative_code_editor.entity.Repo;
import com.example.collaborative_code_editor.enums.NodeType;
import com.example.collaborative_code_editor.exception.ForbiddenException;
import com.example.collaborative_code_editor.exception.ResourceNotFoundException;
import com.example.collaborative_code_editor.repository.NodeRepository;
import com.example.collaborative_code_editor.repository.RepoMemberRepository;
import com.example.collaborative_code_editor.repository.ReopRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutionService {

    @Autowired private NodeRepository nodeRepository;
    @Autowired private ReopRepository repoRepository;
    @Autowired private RepoMemberRepository memberRepository;
    @Autowired private RestTemplate restTemplate;

    private static final String PISTON_URL = "http://piston:2000";

    private Repo getRepoWithAccess(Long repoId, Long userId) {
        Repo repo = repoRepository.findById(repoId)
                .orElseThrow(() -> new ResourceNotFoundException("Repo not found"));
        if (repo.getOwner().getId().equals(userId)) return repo;
        if (memberRepository.existsByRepoIdAndUserId(repoId, userId)) return repo;
        throw new ForbiddenException("You cannot access this repo");
    }

    public ExecutionResult execute(Long repoId, Long fileId, Long userId) {
        getRepoWithAccess(repoId, userId);

        List<Node> allNodes = nodeRepository.findByRepoId(repoId);

        Map<Long, Node> byId = new HashMap<>();
        for (Node n : allNodes) {
            byId.put(n.getId(), n);
        }

        Node entryNode = byId.get(fileId);
        if (entryNode == null) {
            throw new ResourceNotFoundException("File not found");
        }
        if (entryNode.getType() != NodeType.FILE || entryNode.getBlob() == null) {
            throw new ForbiddenException("Node is not an executable file");
        }
        if (!"python".equals(entryNode.getBlob().getLanguage())) {
            throw new ForbiddenException("Only Python execution is supported right now");
        }

        List<Map<String, Object>> files = new ArrayList<>();

        files.add(Map.of(
                "name", relativePath(entryNode, byId),
                "content", entryNode.getBlob().getContent()
        ));

        for (Node n : allNodes) {
            if (n.getId().equals(entryNode.getId())) continue;
            if (n.getType() != NodeType.FILE || n.getBlob() == null) continue;

            files.add(Map.of(
                    "name", relativePath(n, byId),
                    "content", n.getBlob().getContent()
            ));
        }

        Map<String, Object> body = Map.of(
                "language", "python",
                "version", "3.10.0",
                "files", files
        );

        Map<String, Object> response = restTemplate.postForObject(
                PISTON_URL + "/api/v2/execute",
                body,
                Map.class
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> run = (Map<String, Object>) response.get("run");

        String stdout = (String) run.getOrDefault("stdout", "");
        String stderr = (String) run.getOrDefault("stderr", "");
        Integer exitCode = (Integer) run.get("code");

        return new ExecutionResult(stdout, stderr, exitCode);
    }


    private String relativePath(Node node, Map<Long, Node> byId) {
        List<String> parts = new ArrayList<>();
        Node current = node;
        while (current != null) {
            parts.add(0, current.getName());
            current = current.getParent() == null ? null : byId.get(current.getParent().getId());
        }
        return String.join("/", parts);
    }
}