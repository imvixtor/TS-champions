package com.example.football_manager.modules.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopScorerDTO {
    private String playerName;
    private String teamName;
    private String avatarUrl;
    private Long goals;
}
