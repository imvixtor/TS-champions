package com.example.football_manager.modules.match.controller;

import com.example.football_manager.modules.match.dto.*;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.match.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/champions/match")
public class MatchController {
    @Autowired
    private MatchService matchService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Match> createMatch(@RequestBody CreateMatchRequest request){
        return ResponseEntity.ok(matchService.CreateMatch(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/events")
    public ResponseEntity<?> addEvent(@RequestBody MatchEventDTO dto){
        matchService.addEvent(dto);
        return ResponseEntity.ok("Sự kiện đã được ghi nhận");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/finish")
    public ResponseEntity<?> finishMatch(@PathVariable Integer id) {
        matchService.finishMatch(id);
        return ResponseEntity.ok("Trận đấu kết thúc. BXH đã cập nhật.");
    }

    @GetMapping("/top-scorers")
    public ResponseEntity<List<TopScorerDTO>> getTopScorers(@RequestParam Integer tournamentId) {
        return ResponseEntity.ok(matchService.getTopScorers(tournamentId));
    }

    @GetMapping("/by-tournament/{tournamentId}")
    public ResponseEntity<List<MatchDetailResponse>> getMatchesByTournament(@PathVariable Integer tournamentId) {
        return ResponseEntity.ok(matchService.getMatchesByTournament(tournamentId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    @PostMapping("/{id}/lineup")
    public ResponseEntity<?> registerLineup(@PathVariable Integer id, @RequestBody LineupRequest req) {
        matchService.registerLineup(id, req);
        return ResponseEntity.ok("Đăng ký đội hình thành công!");
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDetailResponse> getMatchDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(matchService.getMatchDetail(id));
    }
}
