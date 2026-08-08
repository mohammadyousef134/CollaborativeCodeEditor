package com.example.collaborative_code_editor.service;

import com.example.collaborative_code_editor.DTO.InvitationResponse;
import com.example.collaborative_code_editor.entity.*;
import com.example.collaborative_code_editor.enums.NodeType;
import com.example.collaborative_code_editor.exception.ForbiddenException;
import com.example.collaborative_code_editor.exception.ResourceNotFoundException;
import com.example.collaborative_code_editor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RepoService {
    @Autowired
    private BlobRepository blobRepo;
    @Autowired
    private NodeRepository nodeRepo;
    @Autowired
    private ReopRepository repo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private RepoMemberRepository memberRepo;
    @Autowired
    private RepoInvitationRepository invitationRepo;

    private Repo getRepoWithAccess(Long repoId, Long userId) {

        Repo repo = this.repo.findById(repoId)
                .orElseThrow(() -> new ResourceNotFoundException("Repo not found"));

        // owner allowed
        if (repo.getOwner().getId().equals(userId)) {
            return repo;
        }

        // member allowed
        if (memberRepo.existsByRepoIdAndUserId(repoId, userId)) {
            return repo;
        }

        throw new ForbiddenException("You cannot access this repo");
    }

    public void createRepo(String name, Long userId) {
        Repo repo = new Repo();
        User user = userRepo.findById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );
        repo.setOwner(user);
        repo.setName(name);
        this.repo.save(repo);
    }

    public List<Repo> getMyRepos(Long userId) {
        List<Repo> ownedRepositories = repo.findByOwnerId(userId);
        List<Repo> memberRepositories = memberRepo.findByUserId(userId)
                .stream()
                .map(RepoMember::getRepo)
                .toList();
        ownedRepositories.addAll(memberRepositories);
        return ownedRepositories;

    }

    public void DeleteRepo(Long repoId, Long userId) {
        Repo repo = this.repo.findById(repoId).orElseThrow(() -> new ResourceNotFoundException("Repo not found"));
        getRepoWithAccess(repoId, userId);

        if (!repo.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the owner can delete the repository");
        }
        List<Node> nodes = nodeRepo.findByRepoIdAndParentIsNull(repoId);

        nodes.forEach(this::deleteRecursively);
        invitationRepo.deleteAll(invitationRepo.findByRepoId(repoId));
        memberRepo.deleteAll(memberRepo.findByRepoId(repoId));
        this.repo.delete(repo);
    }

    public void inviteUser(Long repoId, Long userId, String email) {
        Repo repo = this.repo.findById(repoId)
                .orElseThrow(() -> new ResourceNotFoundException("Repo not found"));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!repo.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only owner can invite users");
        }
        if(memberRepo.existsByRepoIdAndUserId(repoId, user.getId())){
            throw new RuntimeException("User already member");
        }

        RepoInvitation invitation = new RepoInvitation();
        invitation.setRepo(repo);
        invitation.setStatus("PENDING");
        invitation.setUser(user);

        invitationRepo.save(invitation);
    }

    public void acceptInvitation(Long invitationId, Long userId) {

        RepoInvitation invitation = invitationRepo.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getUser().getId().equals(userId)) {
            throw new ForbiddenException("This invitation is not for you");
        }

        RepoMember member = new RepoMember();
        member.setRepo(invitation.getRepo());
        member.setUser(invitation.getUser());

        memberRepo.save(member);

        invitation.setStatus("ACCEPTED");
        invitationRepo.save(invitation);
    }

    public void declineInvitation(Long invitationId, Long userId) {

        RepoInvitation invitation = invitationRepo.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getUser().getId().equals(userId)) {
            throw new ForbiddenException("This invitation is not for you");
        }

        invitation.setStatus("DECLINED");

        invitationRepo.save(invitation);
    }

    public List<InvitationResponse> getMyInvitations(Long userId) {

        List<RepoInvitation> invitations =
                invitationRepo.findByUserIdAndStatus(userId, "PENDING");

        return invitations.stream()
                .map(inv -> new InvitationResponse(
                        inv.getId(),
                        inv.getRepo().getId(),
                        inv.getRepo().getName(),
                        inv.getRepo().getOwner().getEmail()
                ))
                .toList();
    }

    private void deleteRecursively(Node node) {
        if (node.getType() == NodeType.FOLDER) {
            List<Node> children = nodeRepo.findByRepoIdAndParentId(node.getRepo().getId(), node.getId());
            for (Node child : children) {
                deleteRecursively(child);
            }
        }
        Blob blob = node.getBlob();
        nodeRepo.delete(node);
        if (blob != null) {
            blobRepo.delete(node.getBlob());
        }
    }
}
