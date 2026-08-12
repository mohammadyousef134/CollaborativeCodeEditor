package com.example.collaborative_code_editor.entity;

import com.example.collaborative_code_editor.enums.MemberRole;
import io.micrometer.core.annotation.Counted;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "repository_members")
@Getter
@Setter
public class RepoMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "repository_id")
    private Repo repo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private MemberRole role;
}
