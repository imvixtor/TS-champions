package com.example.football_manager.modules.team.service.impl;

import com.example.football_manager.modules.match.repository.MatchEventRepository;
import com.example.football_manager.modules.team.dto.PlayerRequest;
import com.example.football_manager.modules.team.dto.PlayerResponse;
import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.PlayerRepository;
import com.example.football_manager.modules.team.repository.TeamRepository;
import com.example.football_manager.modules.team.service.PlayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final MatchEventRepository matchEventRepository;

    @Value("${application.file.upload-dir}")
    private String uploadDir;

    @Override
    public PlayerResponse createPlayer(PlayerRequest request, MultipartFile avatarFile){
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team ID không tồn tại"));

        Player player = new Player();
        player.setName(request.getName());
        player.setShirtNumber(request.getShirtNumber());
        player.setPosition(request.getPosition());
        player.setTeam(team); // Gán Team cho Player

        if (avatarFile != null && !avatarFile.isEmpty()) {
            String avatarUrl = saveAvatar(avatarFile);
            player.setAvatarUrl(avatarUrl); // SỬA: Gán URL cho Player, không phải Team
        }

        Player savedPlayer = playerRepository.save(player);
        return mapToResponse(savedPlayer);
    }

    @Override
    public List<PlayerResponse> getPlayersByTeam(Integer teamId){
        if(!teamRepository.existsById(teamId)){
            throw new RuntimeException("Team ID not found");
        }

        return playerRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional // Quan trọng để xóa sạch
    public void delete(Integer id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cầu thủ"));

        playerRepository.delete(player);
    }

    public PlayerResponse updatePlayer(Integer id, PlayerRequest request, MultipartFile avatarFile){
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("not found player"));

        Team team =  teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team ID không tồn tại"));

        player.setName(request.getName());
        player.setShirtNumber(request.getShirtNumber());
        player.setPosition(request.getPosition());
        player.setTeam(team);

        if (avatarFile != null && !avatarFile.isEmpty()) {
            String avatarUrl = saveAvatar(avatarFile);
            player.setAvatarUrl(avatarUrl);
        }

        Player savedPlayer = playerRepository.save(player);
        return mapToResponse(savedPlayer);
    }

    public PlayerResponse findById(Integer id){
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found player"));
        return mapToResponse(player);
    }

    // function use

    private String saveAvatar(MultipartFile avatarFile){
        if(avatarFile == null || avatarFile.isEmpty()){
            return null;
        }

        try {
            String fileName = System.currentTimeMillis() + "_" + avatarFile.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(avatarFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName;
        }catch (Exception e){
            log.error("can't uploads avatar: " + e);
            throw new RuntimeException("Upload avatar error: " + e.getMessage());
        }

    }

    private PlayerResponse mapToResponse(Player p) {
        PlayerResponse res = new PlayerResponse();
        res.setId(p.getId());
        res.setName(p.getName());
        res.setShirtNumber(p.getShirtNumber());
        res.setPosition(p.getPosition());
        res.setAvatarUrl(p.getAvatarUrl());
        res.setTeamId(p.getTeam().getId());
        res.setTeamName(p.getTeam().getName());
        return res;
    }

}
