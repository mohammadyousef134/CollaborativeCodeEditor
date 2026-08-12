package com.example.collaborative_code_editor.DTO;

import com.example.collaborative_code_editor.enums.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class InvitationResponse {
    private Long invitationId;
    private Long repoId;
    private String repoName;
    private String invitedBy;
    private MemberRole role;

}