package com.example.football_manager.modules.team.dto;

import com.example.football_manager.common.baseEntity.Enum.Position;
import lombok.Data;

@Data
public class PlayerResponse {
    private Long id;
    private String name;
    private Integer shirtNumber;
    private Position position;
    private String avatarUrl;

    private Long teamId;
    private String teamName;
}
