package com.example.football_manager.modules.match.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateMatchRequest {
    private Integer tournamentId;
    private Integer homeTeamId;
    private Integer awayTeamId;
    private LocalDateTime matchDate;
    private String roundName;
}
