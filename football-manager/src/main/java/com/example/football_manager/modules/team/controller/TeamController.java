package com.example.football_manager.modules.team.controller;

import com.example.football_manager.modules.team.dto.TeamRequest;
import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/champions/team")
@RequiredArgsConstructor
public class TeamController {
    private TeamService teamService;

    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<?> createTeam(@RequestPart("team") @Valid TeamRequest team,
                                        @Valid @RequestPart(value = "logo", required = false) MultipartFile logo){
        TeamResponse response = teamService.createTeam(team, logo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable Long id){
        return ResponseEntity.ok(teamService.getTeam(id));
    }

    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateTeam(
            @PathVariable Long id,
            @RequestPart("team") TeamRequest request,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ){
        TeamResponse response = teamService.updateTeam(id, request, logo);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public  ResponseEntity<?> deleteTeam(@PathVariable Long id){
        teamService.delete(id);
        return ResponseEntity.ok("xóa thành công " + id);
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.findAll());
        // Bạn cần viết hàm findAll() trong Service trả về List<TeamResponse>
    }

    // 2. Tìm kiếm đội bóng
    @GetMapping("/search")
    public ResponseEntity<List<TeamResponse>> searchTeams(@RequestParam String name) {
        return ResponseEntity.ok(teamService.searchByName(name));
    }

}
