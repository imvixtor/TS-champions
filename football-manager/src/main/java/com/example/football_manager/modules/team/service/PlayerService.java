package com.example.football_manager.modules.team.service;

import com.example.football_manager.modules.team.dto.PlayerRequest;
import com.example.football_manager.modules.team.dto.PlayerResponse;
import com.example.football_manager.modules.team.entity.Player;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PlayerService {
    List<PlayerResponse> getPlayersByTeam(Integer teamId);

    PlayerResponse createPlayer(PlayerRequest request, MultipartFile avatarFile);

    void delete(Integer id);

    PlayerResponse updatePlayer(Integer id, PlayerRequest request, MultipartFile avatarFile);

    PlayerResponse findById(Integer id);
}
