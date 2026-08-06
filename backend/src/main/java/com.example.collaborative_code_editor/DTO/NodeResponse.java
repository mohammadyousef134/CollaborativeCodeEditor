package com.example.collaborative_code_editor.DTO;

import com.example.collaborative_code_editor.enums.NodeType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NodeResponse {
    private Long id;
    private String name;
    private Long parentId;
    private NodeType type;
    private String language;
}
