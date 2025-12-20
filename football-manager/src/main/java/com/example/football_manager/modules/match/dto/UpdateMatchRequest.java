package com.example.football_manager.modules.match.dto;

import com.example.football_manager.common.baseEntity.Enum.MatchStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateMatchRequest {
    private LocalDateTime matchDate;
    private String stadium;
    private Integer homeScore; // Cho phép sửa tỉ số thủ công nếu cần
    private Integer awayScore;
    private MatchStatus status;
}
