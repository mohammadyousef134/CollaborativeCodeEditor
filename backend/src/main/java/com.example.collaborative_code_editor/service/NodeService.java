package com.example.collaborative_code_editor.service;

import com.example.collaborative_code_editor.DTO.FileContentResponse;
import com.example.collaborative_code_editor.DTO.NodeResponse;
import com.example.collaborative_code_editor.entity.*;
import com.example.collaborative_code_editor.enums.NodeType;
import com.example.collaborative_code_editor.exception.ForbiddenException;
import com.example.collaborative_code_editor.exception.ResourceNotFoundException;
import com.example.collaborative_code_editor.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NodeService {
    @Autowired
    private NodeRepository nodeRepository;
    @Autowired
    private ReopRepository repoRepository;
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

    private Node getOwnedNode(Long repoId, Long nodeId) {
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found"));
        if (!node.getRepo().getId().equals(repoId)) {
            throw new ForbiddenException("Node does not belong to this repo");
        }
        return node;
    }

    private NodeResponse toResponse(Node node) {
        Long parentId = node.getParent() != null ? node.getParent().getId() : null;
        String language = node.getBlob() != null ? node.getBlob().getLanguage() : null;
        return new NodeResponse(node.getId(), node.getName(), parentId, node.getType(), language);
    }

    private FileContentResponse toFileContentResponse(Node node) {
        FileContentResponse res = new FileContentResponse();
        res.setId(node.getId());
        res.setName(node.getName());
        res.setParentId(node.getParent() == null ? null : node.getParent().getId());
        res.setLanguage(node.getBlob() == null ? null : node.getBlob().getLanguage());
        res.setContent(node.getBlob() == null ? null : node.getBlob().getContent());
        return res;
    }

    // folderId == null -> repo root nodes
    public List<NodeResponse> getNodes(Long repoId, Long folderId, Long userId) {
        getRepoWithAccess(repoId, userId);

        List<Node> nodes;
        if (folderId == null) {
            nodes = nodeRepository.findByRepoIdAndParentIsNull(repoId);
        } else {
            Node folder = getOwnedNode(repoId, folderId);
            if (folder.getType() != NodeType.FOLDER) {
                throw new ForbiddenException("Node is not a folder");
            }
            nodes = nodeRepository.findByRepoIdAndParentId(repoId, folderId);
        }

        return nodes.stream().map(this::toResponse).toList();
    }

    public NodeResponse renameNode(Long repoId, Long nodeId, Long userId, String name) {
        getRepoWithAccess(repoId, userId);
        Node node = getOwnedNode(repoId, nodeId);

        if (name == null || name.isBlank()) {
            throw new ForbiddenException("Name cannot be empty");
        }

        boolean nameChanged = !name.equals(node.getName());

        if (nameChanged) {
            Long parentId = node.getParent() == null ? null : node.getParent().getId();
            boolean exists = parentId == null
                    ? nodeRepository.existsByRepoIdAndParentIsNullAndName(repoId, name)
                    : nodeRepository.existsByRepoIdAndParentIdAndName(repoId, parentId, name);
            if (exists) {
                throw new ForbiddenException("A node with this name already exists here");
            }
        }

        node.setName(name);
        nodeRepository.save(node);

        return toResponse(node);
    }

    public NodeResponse moveNode(Long repoId, Long nodeId, Long userId, Long parentId) {
        getRepoWithAccess(repoId, userId);
        Node node = getOwnedNode(repoId, nodeId);

        Node newParent = null;
        if (parentId != null) {
            if (parentId.equals(nodeId)) {
                throw new ForbiddenException("A node cannot be its own parent");
            }
            newParent = getOwnedNode(repoId, parentId);
            if (newParent.getType() != NodeType.FOLDER) {
                throw new ForbiddenException("Parent must be a folder");
            }
            if (node.getType() == NodeType.FOLDER && isDescendant(newParent, node)) {
                throw new ForbiddenException("Cannot move a folder into its own subtree");
            }
        }

        Long currentParentId = node.getParent() == null ? null : node.getParent().getId();
        boolean parentChanged = parentId == null
                ? currentParentId != null
                : !parentId.equals(currentParentId);

        if (parentChanged) {
            boolean exists = parentId == null
                    ? nodeRepository.existsByRepoIdAndParentIsNullAndName(repoId, node.getName())
                    : nodeRepository.existsByRepoIdAndParentIdAndName(repoId, parentId, node.getName());
            if (exists) {
                throw new ForbiddenException("A node with this name already exists in the target folder");
            }
        }

        node.setParent(newParent);
        nodeRepository.save(node);

        return toResponse(node);
    }

    private boolean isDescendant(Node candidate, Node ancestor) {
        Node current = candidate;
        while (current != null) {
            if (current.getId().equals(ancestor.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    public NodeResponse createNode(Long repoId, Long userId, String name, String language, String type, Long parentId) {
        Repo repo = getRepoWithAccess(repoId, userId);

        NodeType nodeType;
        try {
            nodeType = NodeType.valueOf(type);
        } catch (Exception e) {
            throw new ForbiddenException("type must be FILE or FOLDER");
        }

        boolean exists = parentId == null
                ? nodeRepository.existsByRepoIdAndParentIsNullAndName(repoId, name)
                : nodeRepository.existsByRepoIdAndParentIdAndName(repoId, parentId, name);
        if (exists) {
            throw new ForbiddenException("A node with this name already exists here");
        }

        Node parent = null;
        if (parentId != null) {
            parent = getOwnedNode(repoId, parentId);
            if (parent.getType() != NodeType.FOLDER) {
                throw new ForbiddenException("Parent must be a folder");
            }
        }

        Node node = new Node(name, nodeType);
        node.setRepo(repo);
        node.setParent(parent);

        if (nodeType == NodeType.FILE) {
            Blob blob = new Blob();
            blob.setContent("");
            blob.setLanguage(language);
            blobRepository.save(blob);
            node.setBlob(blob);
        }

        nodeRepository.save(node);
        return toResponse(node);
    }


    public FileContentResponse getFile(Long repoId, Long fileId, Long userId) {
        getRepoWithAccess(repoId, userId);
        Node node = getOwnedNode(repoId, fileId);
        if (node.getType() != NodeType.FILE) {
            throw new ForbiddenException("Node is not a file");
        }
        return toFileContentResponse(node);
    }

    public NodeResponse updateFile(Long repoId, Long fileId, Long userId, String content) {
        getRepoWithAccess(repoId, userId);
        Node node = getOwnedNode(repoId, fileId);

        if (node.getType() != NodeType.FILE) {
            throw new ForbiddenException("Only file nodes can be updated");
        }
        if (node.getBlob() == null) {
            throw new ResourceNotFoundException("Blob not found for this file");
        }

        node.getBlob().setContent(content == null ? "" : content);
        blobRepository.save(node.getBlob());
        nodeRepository.save(node);

        return toResponse(node);
    }

    public void deleteNode(Long repoId, Long nodeId, Long userId) {
        getRepoWithAccess(repoId, userId);
        Node node = getOwnedNode(repoId, nodeId);
        deleteRecursively(node);
    }

    public NodeResponse getNode(Long repoId, Long nodeId, Long userId) {
        getRepoWithAccess(repoId, userId);
        Node node = getOwnedNode(repoId, nodeId);
        return toResponse(node);
    }

    private void deleteRecursively(Node node) {
        if (node.getType() == NodeType.FOLDER) {
            List<Node> children = nodeRepository.findByRepoIdAndParentId(node.getRepo().getId(), node.getId());
            for (Node child : children) {
                deleteRecursively(child);
            }
        }
        Blob blob = node.getBlob();
        nodeRepository.delete(node);
        if (blob != null) {
            blobRepository.delete(node.getBlob());
        }
    }
}
