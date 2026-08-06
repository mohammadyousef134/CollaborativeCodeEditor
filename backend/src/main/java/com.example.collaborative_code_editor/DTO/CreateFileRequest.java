package com.example.collaborative_code_editor.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateFileRequest {
    private String name;
    private String language;
    private String type;
    private Long parentId;
}
