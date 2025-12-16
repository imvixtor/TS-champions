package com.example.football_manager.modules.team.service;

import com.example.football_manager.modules.team.dto.TeamRequest;
import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Team;
import org.jspecify.annotations.Nullable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TeamService {

    public TeamResponse createTeam(TeamRequest dto, MultipartFile logoFile);
    public TeamResponse getTeam(Integer id);
    public TeamResponse updateTeam(Integer id, TeamRequest dto, MultipartFile logoFile);
    public void delete(Integer id);

    public List<TeamResponse> findAll();

    public List<TeamResponse> searchByName(String name);
}
