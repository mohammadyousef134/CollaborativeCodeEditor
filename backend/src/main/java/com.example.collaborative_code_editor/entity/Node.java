package com.example.collaborative_code_editor.entity;

import com.example.collaborative_code_editor.enums.NodeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "nodes")
@NoArgsConstructor
public class Node {

    public Node(String name, NodeType type) {
        this.name = name;
        this.type = type;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private NodeType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repo_id")
    private Repo repo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Node parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blob_id")
    private Blob blob;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
