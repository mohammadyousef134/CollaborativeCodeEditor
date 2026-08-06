package com.example.collaborative_code_editor.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateFolderRequest {
    private String name;
    private Long parentId;
}