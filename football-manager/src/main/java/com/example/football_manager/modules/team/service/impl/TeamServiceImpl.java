package com.example.football_manager.modules.team.service.impl;

import com.example.football_manager.modules.team.dto.Map.TeamMapper;
import com.example.football_manager.modules.team.dto.TeamRequest;
import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.PlayerRepository;
import com.example.football_manager.modules.team.repository.TeamRepository;
import com.example.football_manager.modules.team.service.TeamService;
import com.example.football_manager.modules.tournament.entity.TournamentTeam;
import com.example.football_manager.modules.tournament.repository.TournamentTeamRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TeamServiceImpl implements TeamService {
    @Value("${application.file.upload-dir}")
    private String uploadDir;

    @Autowired private TeamRepository teamRepository;
    @Autowired private PlayerRepository playerRepository;
    @Autowired private TournamentTeamRepository tournamentTeamRepository;

    private String saveLogo(MultipartFile logoFile) {
        if (logoFile == null || logoFile.isEmpty()) {
            return null;
        }
        try {
            String fileName = System.currentTimeMillis() + "_" + logoFile.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(logoFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName;

        } catch (IOException e) {
            log.error("Lỗi lưu file logo", e);
            throw new RuntimeException("Upload logo error: " + e.getMessage());
        }
    }

    private void applyTeamFields(Team team, TeamRequest dto, MultipartFile logoFile) {
        team.setName(dto.getName());
        team.setShortName(dto.getShortName());
        team.setCoachName(dto.getCoachName());
        team.setHomeStadium(dto.getHomeStadium());

        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = saveLogo(logoFile);
            team.setLogoUrl(logoUrl);
        }
    }

    private TeamResponse mapToResponse(Team team) {
        TeamResponse res = new TeamResponse();
        res.setId(team.getId());
        res.setName(team.getName());
        res.setShortName(team.getShortName());
        res.setCoachName(team.getCoachName());
        res.setHomeStadium(team.getHomeStadium());
        res.setLogoUrl(team.getLogoUrl());
        return res;
    }

    private void deleteLogoFile(String logoUrl){
        try {
            String fileName = logoUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).resolve(fileName);

            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Không thể xóa file logo" + logoUrl, e);
        }
    }



    @Override
    public TeamResponse createTeam(TeamRequest dto, MultipartFile logoFile) {
        Team team = new Team();

        // Dùng chung
        applyTeamFields(team, dto, logoFile);

        Team saved = teamRepository.save(team);

        return TeamMapper.toResponse(saved);
    }

    @Override
    public TeamResponse updateTeam(Integer id, TeamRequest dto, MultipartFile logoFile) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        // Dùng chung
        applyTeamFields(team, dto, logoFile);

        Team saved = teamRepository.save(team);

        return TeamMapper.toResponse(saved);
    }

    @Override
    public TeamResponse getTeam(Integer id){
     Team team = teamRepository.findById(id).orElseThrow(() ->
             new RuntimeException("Đội không tồn tại"));

     return TeamMapper.toResponse(team);
    }

    @Override
    @Transactional // <--- QUAN TRỌNG: Để đảm bảo xóa hết hoặc không xóa gì
    public void delete(Integer id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội bóng"));

        List<Player> players = playerRepository.findByTeamId(id);
        playerRepository.deleteAll(players);

        // 3. Xóa thống kê trong các giải đấu (TournamentTeam)
        // (Giả sử bạn có TournamentTeamRepository)
        tournamentTeamRepository.deleteByTeamId(id);

        teamRepository.delete(team);
    }

    public List<TeamResponse> findAll(){
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamResponse> searchByName(String name) {
        return teamRepository.findByNameContainingIgnoreCase(name).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }


