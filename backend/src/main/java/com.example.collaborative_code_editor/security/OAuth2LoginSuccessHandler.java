package com.example.collaborative_code_editor.security;

import com.example.collaborative_code_editor.entity.User;
import com.example.collaborative_code_editor.enums.Role;
import com.example.collaborative_code_editor.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final String frontendRedirectUri;

    public OAuth2LoginSuccessHandler(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            @Value("${app.oauth2.redirect-uri}") String frontendRedirectUri
    ) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.frontendRedirectUri = frontendRedirectUri;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oauthUser.getAttributes();
        String registrationId = extractRegistrationId(request);
        String email;
        String name;

        if ("github".equals(registrationId)) {
            email = (String) attributes.get("email");
            name = attributes.get("name") != null ? (String) attributes.get("name") : (String) attributes.get("login");

            if (email == null) {
                email = attributes.get("id") + "+github@users.noreply.local";
            }
        } else {
            // google
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        }

        String finalEmail = email;
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setName(name != null ? name : finalEmail);
            newUser.setPassword(null); // OAuth2 account, no password login
            newUser.setRole(Role.USER);
            return userRepository.save(newUser);
        });

        String token = jwtUtil.generateToken(user.getId());

        response.sendRedirect(frontendRedirectUri + "?token=" + token);
    }

    private String extractRegistrationId(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.substring(path.lastIndexOf('/') + 1);
    }
}