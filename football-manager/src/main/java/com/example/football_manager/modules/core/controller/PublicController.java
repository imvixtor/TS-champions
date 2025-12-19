package com.example.football_manager.modules.core.controller;

import com.example.football_manager.modules.match.dto.MatchDetailResponse;
import com.example.football_manager.modules.match.service.MatchService;
import com.example.football_manager.modules.tournament.dto.StandingResponse;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/champions/public")
@RequiredArgsConstructor
public class PublicController {

    private final MatchService matchService;
    private final TournamentService tournamentService;

    // 1. Lấy danh sách giải đấu (để khách chọn xem BXH giải nào)
    @GetMapping("/tournaments")
    public ResponseEntity<List<Tournament>> getTournaments() {
        return ResponseEntity.ok(tournamentService.findAll());
    }

    // 2. Lấy BXH của 1 giải
    @GetMapping("/tournament/{id}/standings")
    public ResponseEntity<List<StandingResponse>> getStandings(@PathVariable Integer id) {
        return ResponseEntity.ok(tournamentService.getStandings(id));
    }

    // 3. Lấy Lịch thi đấu trong tuần (Trang chủ)
    @GetMapping("/matches/weekly")
    public ResponseEntity<List<MatchDetailResponse>> getWeeklyMatches() {
        return ResponseEntity.ok(matchService.getPublicMatchesThisWeek());
    }
}