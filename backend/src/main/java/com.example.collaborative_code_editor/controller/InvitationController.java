package com.example.collaborative_code_editor.controller;

import com.example.collaborative_code_editor.DTO.InvitationResponse;
import com.example.collaborative_code_editor.security.SecurityUtils;
import com.example.collaborative_code_editor.service.RepoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invitations")
public class InvitationController {
    @Autowired
    private RepoService service;

    @GetMapping
    public List<InvitationResponse> getMyInvitations() {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getMyInvitations(userId);
    }

    @PostMapping("/{invitationId}/accept")
    public void acceptInvitation(@PathVariable Long invitationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        service.acceptInvitation(invitationId, userId);
    }

    @PostMapping("/{invitationId}/decline")
    public void declineInvitation(@PathVariable Long invitationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        service.declineInvitation(invitationId, userId);
    }

}