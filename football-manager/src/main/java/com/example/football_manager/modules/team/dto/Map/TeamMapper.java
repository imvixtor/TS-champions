package com.example.football_manager.modules.team.dto.Map;

import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Team;

public class TeamMapper {
    public static TeamResponse toResponse(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getShortName(),
                team.getCoachName(),
                team.getHomeStadium(),
                team.getLogoUrl()
        );
    }
}

