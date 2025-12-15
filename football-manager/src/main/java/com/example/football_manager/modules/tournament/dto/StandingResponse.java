package com.example.football_manager.modules.tournament.dto;

import lombok.Data;

@Data
public class StandingResponse {
    private Long teamId;
    private String teamName;
    private String teamLogo;
    private String groupName;
    private Integer points;
    private Integer played;
    private Integer won;
    private Integer drawn;
    private Integer lost;
    private Integer gd; // Hiệu số (Goal Difference)
}
