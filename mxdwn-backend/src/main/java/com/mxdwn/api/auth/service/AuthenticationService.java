package com.mxdwn.api.auth.service;

import com.mxdwn.api.auth.dto.AuthResponse;
import com.mxdwn.api.auth.dto.LoginRequest;
import com.mxdwn.api.auth.dto.RegisterRequest;
import com.mxdwn.api.auth.entity.Role;
import com.mxdwn.api.auth.entity.User;
import com.mxdwn.api.exception.EmailAlreadyInUseException;
import com.mxdwn.api.auth.jwt.JwtService;
import com.mxdwn.api.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@RequiredArgsConstructor
@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.findByEmail(email).isEmpty()) {
            String hashed = passwordEncoder.encode(request.password());
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setDisplayName(request.displayName());
            newUser.setPassword(hashed);
            newUser.setRole(Role.USER);

            User savedUser = userRepository.save(newUser);

            String token = jwtService.generateToken(savedUser);
            return new AuthResponse(
                    token,
                    savedUser.getId(),
                    savedUser.getEmail(),
                    savedUser.getDisplayName()
            );
        } else {
            throw new EmailAlreadyInUseException(email);
        }
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );
        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getDisplayName()
        );

    }
}
