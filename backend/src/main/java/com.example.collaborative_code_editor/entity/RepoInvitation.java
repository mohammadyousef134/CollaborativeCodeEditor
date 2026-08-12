package com.example.collaborative_code_editor.entity;

import com.example.collaborative_code_editor.enums.MemberRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "repo_invitations")
@NoArgsConstructor
public class RepoInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "repo_id")
    private Repo repo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private MemberRole role;
}