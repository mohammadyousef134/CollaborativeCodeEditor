package com.example.collaborative_code_editor.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ExecutionResult {
    private String stdout;
    private String stderr;
    private Integer exitCode;
}