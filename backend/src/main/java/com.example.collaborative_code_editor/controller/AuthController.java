package com.example.collaborative_code_editor.controller;

import com.example.collaborative_code_editor.DTO.RegisterRequest;
import com.example.collaborative_code_editor.DTO.UserResponse;
import com.example.collaborative_code_editor.DTO.loginRequest;
import com.example.collaborative_code_editor.security.SecurityUtils;
import com.example.collaborative_code_editor.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        service.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody loginRequest request) {
        return service.login(request);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        return service.getCurrentUser(userId);
    }


}