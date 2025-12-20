package com.example.football_manager.modules.auth.dto;
import lombok.Data;

@Data
public class RegisterCoachRequest {
    private String username;
    private String password;
    private Integer teamId; // ID đội bóng muốn gán
}