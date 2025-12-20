package com.example.football_manager.modules.core.controller;

import com.example.football_manager.modules.match.dto.MatchDetailResponse;
import com.example.football_manager.modules.match.service.MatchService;
import com.example.football_manager.modules.tournament.dto.StandingResponse;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/champions/public")
@RequiredArgsConstructor
public class PublicController {

    private final MatchService matchService;
    private final TournamentService tournamentService;

    @GetMapping("/tournaments")
    public ResponseEntity<List<Tournament>> getTournaments() {
        return ResponseEntity.ok(tournamentService.findAll());
    }

    @GetMapping("/tournament/{id}/standings")
    public ResponseEntity<List<StandingResponse>> getStandings(@PathVariable Integer id) {
        return ResponseEntity.ok(tournamentService.getStandings(id));
    }

    @GetMapping("/matches/weekly")
    public ResponseEntity<List<MatchDetailResponse>> getWeeklyMatches() {
        return ResponseEntity.ok(matchService.getPublicMatchesThisWeek());
    }

    @GetMapping("/match/{id}")
    public ResponseEntity<MatchDetailResponse> getMatchDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(matchService.getMatchDetail(id));
    }

    @GetMapping("/matches/search")
    public ResponseEntity<List<MatchDetailResponse>> searchMatches(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Integer tournamentId
    ) {
        return ResponseEntity.ok(matchService.searchPublicMatches(date, tournamentId));
    }
}