package com.example.collaborative_code_editor.DTO;

import com.example.collaborative_code_editor.enums.MemberRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteUserToRepoRequest {
    private String email;
    private MemberRole role;
}
