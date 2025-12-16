package com.example.football_manager.modules.match.dto;

import com.example.football_manager.common.baseEntity.Enum.EventType;
import lombok.Data;

@Data
public class MatchEventDTO {
    private Integer matchId;
    private Integer teamId;
    private Integer playerId;
    private EventType type;
    private Integer minute;
}
