package com.example.football_manager.modules.team.controller;

import com.example.football_manager.modules.team.dto.TeamRequest;
import com.example.football_manager.modules.team.dto.TeamResponse;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/champions/team")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<?> createTeam(@RequestPart("team") @Valid TeamRequest team,
                                        @Valid @RequestPart(value = "logo", required = false) MultipartFile logo){
        TeamResponse response = teamService.createTeam(team, logo);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable Integer id){
        return ResponseEntity.ok(teamService.getTeam(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateTeam(
            @PathVariable Integer id,
            @RequestPart("team") TeamRequest request,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ){
        TeamResponse response = teamService.updateTeam(id, request, logo);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public  ResponseEntity<?> deleteTeam(@PathVariable Integer id){
        teamService.delete(id);
        return ResponseEntity.ok("xóa thành công " + id);
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<List<TeamResponse>> searchTeams(@RequestParam String name) {
        return ResponseEntity.ok(teamService.searchByName(name));
    }


}
