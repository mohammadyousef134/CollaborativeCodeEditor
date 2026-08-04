package com.example.collaborative_code_editor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "blobs")
public class Blob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String language;

    private LocalDateTime createdAt;

    public Blob() {
        this.createdAt = LocalDateTime.now();
    }
}