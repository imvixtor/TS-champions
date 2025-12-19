package com.example.football_manager.modules.auth.dto;

import com.example.football_manager.common.baseEntity.Enum.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private Role role;
}
