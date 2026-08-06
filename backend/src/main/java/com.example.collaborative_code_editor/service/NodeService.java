package com.example.collaborative_code_editor.service;

import com.example.collaborative_code_editor.DTO.NodeResponse;
import com.example.collaborative_code_editor.entity.*;
import com.example.collaborative_code_editor.enums.NodeType;
import com.example.collaborative_code_editor.exception.ForbiddenException;
import com.example.collaborative_code_editor.exception.ResourceNotFoundException;
import com.example.collaborative_code_editor.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NodeService {
    @Autowired
    private NodeRepository nodeRepository;
    @Autowired
    private ReopRepository repoRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RepoMemberRepository memberRepository;
    @Autowired
    private BlobRepository blobRepository;


    private Repo getRepoWithAccess(Long repoId, Long userId) {

        Repo repo = repoRepository.findById(repoId)
                .orElseThrow(() -> new ResourceNotFoundException("Repo not found"));

        // owner
        if (repo.getOwner().getId().equals(userId)) {
            return repo;
        }

        // collaborator
        if (memberRepository.existsByRepoIdAndUserId(repoId, userId)) {
            return repo;
        }

        throw new ForbiddenException("You cannot access this repo");
    }

    public List<NodeResponse> getNodes(Long repoId, Long userId) {

        getRepoWithAccess(repoId, userId);

        List<Node> nodes = nodeRepository.findByRepoId(repoId);
        List<NodeResponse> res = new ArrayList<>();
        for (Node node : nodes) {
            NodeResponse nodeResponse = new NodeResponse(node.getId(), node.getName(), node.getParent().getId(), node.getType(), node.getBlob().getLanguage());
            res.add(nodeResponse);
        }
        return res;
    }

    public NodeResponse createFile(Long repoId, Long userId, String name, String language) {

        Repo repo = getRepoWithAccess(repoId, userId);

        Blob blob = new Blob();
        blob.setContent("");
        blob.setLanguage(language);

        blobRepository.save(blob);

        Node file = new Node(name, NodeType.FILE);
        file.setRepo(repo);
        file.setBlob(blob);

        NodeResponse nodeResponse = new NodeResponse(file.getId(), file.getName(), file.getParent().getId(), file.getType(), file.getBlob().getLanguage());

        nodeRepository.save(file);
        return nodeResponse;
    }

    public NodeResponse updateFile(Long repoId,
                               Long fileId,
                               Long userId,
                               String content) {

        getRepoWithAccess(repoId, userId);

        Node node = nodeRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!node.getRepo().getId().equals(repoId)) {
            throw new ForbiddenException("File does not belong to this repo");
        }

        if (node.getType() != NodeType.FILE) {
            throw new ForbiddenException("Only file nodes can be updated");
        }

        if (node.getBlob() == null) {
            throw new ResourceNotFoundException("Blob not found for this file");
        }

        String oldContent = node.getBlob().getContent();
        String newContent = content == null ? "" : content;

        Blob blob = node.getBlob();
        if (!oldContent.equals(newContent)) {

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            blob.setContent(newContent);
        }

        blobRepository.save(blob);
        nodeRepository.save(node);

        NodeResponse nodeResponse = new NodeResponse(node.getId(), node.getName(), node.getParent().getId(), node.getType(), node.getBlob().getLanguage());

        return nodeResponse;
    }

    public void deleteFile(Long repoId, Long fileId, Long userId) {
        Repo repo = getRepoWithAccess(repoId, userId);

        Node node = nodeRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!node.getRepo().getId().equals(repoId)) {
            throw new ForbiddenException("File does not belong to this repo");
        }

        nodeRepository.delete(node);
    }


    public NodeResponse getFile(Long repoId, Long fileId, Long userId) {

        getRepoWithAccess(repoId, userId);

        Node node = nodeRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!node.getRepo().getId().equals(repoId)) {
            throw new ForbiddenException("File does not belong to this repo");
        }
        NodeResponse nodeResponse = new NodeResponse(node.getId(), node.getName(), node.getParent().getId(), node.getType(), node.getBlob().getLanguage());
        return nodeResponse;
    }
}