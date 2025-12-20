package com.example.football_manager.modules.team.controller;

import com.example.football_manager.modules.team.dto.PlayerRequest;
import com.example.football_manager.modules.team.dto.PlayerResponse;
import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/champions/player")
@RequiredArgsConstructor
public class PlayerController {
    private final PlayerService playerService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'COACH')")
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<PlayerResponse> createPlayer(@RequestPart("player") PlayerRequest player,
                                                       @RequestPart(value = "avatar", required = false)MultipartFile avatarFile){
        PlayerResponse response = playerService.createPlayer(player, avatarFile);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'COACH')")
    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<PlayerResponse>> getPlayerByTeam(@PathVariable Integer teamId){
        return ResponseEntity.ok(playerService.getPlayersByTeam(teamId));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'COACH')")
    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public ResponseEntity<PlayerResponse> updatePlayer(@PathVariable Integer id,
                                                       @RequestPart("player") PlayerRequest player,
                                                       @RequestPart(value = "avatar", required = false) MultipartFile avatarFile){
        PlayerResponse response = playerService.updatePlayer(id, player, avatarFile);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Integer id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'COACH')")
    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponse> getPlayerDetail(@PathVariable Integer id){
        return ResponseEntity.ok(playerService.findById(id));
    }

}
