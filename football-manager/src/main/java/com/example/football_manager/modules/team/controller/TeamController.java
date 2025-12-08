package com.example.football_manager.modules.team.controller;

import com.example.football_manager.modules.team.dto.TeamRequest;
import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/team")
public class TeamController {
    @Autowired private TeamService teamService;

    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<?> createTeam(@RequestPart("team") TeamRequest team, @RequestPart(value = "logo", required = false) MultipartFile logo){
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
}
