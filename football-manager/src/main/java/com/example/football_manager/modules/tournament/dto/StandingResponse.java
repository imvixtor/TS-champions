package com.example.football_manager.modules.tournament.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StandingResponse {
    private Integer teamId;
    private String teamName;
    private String teamLogo;
    private String groupName;
    private Integer points;
    private Integer played;
    private Integer won;
    private Integer drawn;
    private Integer lost;
    private Integer gd; // Hiệu số (Goal Difference)

    @JsonProperty("isSeeded")
    private boolean isSeeded;

    private Integer yellowCards;
    private Integer redCards;
    private Integer fairPlayScore;
}
