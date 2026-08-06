package com.example.collaborative_code_editor.DTO;

import com.example.collaborative_code_editor.entity.Node;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileContentResponse {
    private Long id;
    private String name;
    private Long parentId;
    private String language;
    private String content;

    public static FileContentResponse from(Node node) {
        FileContentResponse res = new FileContentResponse();
        res.id = node.getId();
        res.name = node.getName();
        res.parentId = node.getParent() == null ? null : node.getParent().getId();
        res.language = node.getBlob() == null ? null : node.getBlob().getLanguage();
        res.content = node.getBlob() == null ? null : node.getBlob().getContent();
        return res;
    }
}