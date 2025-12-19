package com.example.football_manager.modules.auth.service;

import com.example.football_manager.common.baseEntity.Enum.Role;
import com.example.football_manager.modules.auth.dto.AuthResponse;
import com.example.football_manager.modules.auth.dto.LoginRequest;
import com.example.football_manager.modules.auth.dto.RegisterRequest;
import com.example.football_manager.modules.auth.entity.User;
import com.example.football_manager.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request){
        var user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullname(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);

        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }

    public  AuthResponse login(LoginRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        var user = repository.findByUsername(request.getUsername()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return  new AuthResponse(jwtToken);
    }
}
