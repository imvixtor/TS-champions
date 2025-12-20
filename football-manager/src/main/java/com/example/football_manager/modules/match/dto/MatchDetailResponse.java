package com.example.football_manager.modules.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchDetailResponse {
    private Integer id;
    private LocalDateTime matchDate;
    private String stadium;
    private String roundName;
    private String status;

    private Integer homeScore;
    private Integer awayScore;

    // Đội nhà
    private Integer homeTeamId;
    private String homeTeam; // Tên đội nhà
    private String homeLogo;

    private String groupName;

    // Đội khách
    private Integer awayTeamId;
    private String awayTeam; // Tên đội khách
    private String awayLogo;

    private List<MatchEventResponse> events;
}
