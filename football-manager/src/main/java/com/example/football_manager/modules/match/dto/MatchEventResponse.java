package com.example.football_manager.modules.match.dto;

import com.example.football_manager.common.baseEntity.Enum.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchEventResponse {
    private EventType type; // GOAL, RED_CARD...
    private Integer minute;
    private Integer teamId;
    private String playerName;
    private Integer playerNumber;
}