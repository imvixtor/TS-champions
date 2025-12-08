package com.example.football_manager.modules.team.service;

import com.example.football_manager.modules.team.dto.TeamRequest;
import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Team;
import org.springframework.web.multipart.MultipartFile;

public interface TeamService {

    public TeamResponse createTeam(TeamRequest dto, MultipartFile logoFile);
    public TeamResponse getTeam(Long id);
    public TeamResponse updateTeam(Long id, TeamRequest dto, MultipartFile logoFile);

}
