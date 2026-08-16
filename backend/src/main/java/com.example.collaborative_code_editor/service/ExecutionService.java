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

    private record RuntimeSpec(String pistonLanguage, String version, String extension) {}

    private static final Map<String, RuntimeSpec> RUNTIMES = Map.of(
            "python", new RuntimeSpec("python", "3.10.0", ".py"),
            "cpp", new RuntimeSpec("c++", "10.2.0", ".cpp"),
            "csharp", new RuntimeSpec("csharp", "6.12.0", ".cs")
    );


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

        String language = entryNode.getBlob().getLanguage();
        RuntimeSpec spec = RUNTIMES.get(language);
        if (spec == null) {
            throw new ForbiddenException("Unsupported language for execution: " + language);
        }

        List<Map<String, Object>> files = new ArrayList<>();

        files.add(Map.of(
                "name", relativePath(entryNode, byId, language, spec.extension()),
                "content", entryNode.getBlob().getContent()
        ));

        for (Node n : allNodes) {
            if (n.getId().equals(entryNode.getId())) continue;
            if (n.getType() != NodeType.FILE || n.getBlob() == null) continue;
            if (!language.equals(n.getBlob().getLanguage())) continue;

            files.add(Map.of(
                    "name", relativePath(n, byId, language, spec.extension()),
                    "content", n.getBlob().getContent()
            ));
        }

        Map<String, Object> body = Map.of(
                "language", spec.pistonLanguage(),
                "version", spec.version(),
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


    private String relativePath(Node node, Map<Long, Node> byId, String language, String extension) {
        List<String> folderParts = new ArrayList<>();
        Node current = node.getParent() == null ? null : byId.get(node.getParent().getId());
        while (current != null) {
            folderParts.add(0, current.getName());
            current = current.getParent() == null ? null : byId.get(current.getParent().getId());
        }

        String fileName = resolveFileName(node, language, extension);
        folderParts.add(fileName);
        return String.join("/", folderParts);
    }

    private String resolveFileName(Node node, String language, String extension) {
        return ensureExtension(node.getName(), extension);
    }

    private String ensureExtension(String name, String extension) {
        return name.toLowerCase().endsWith(extension.toLowerCase()) ? name : name + extension;
    }

}