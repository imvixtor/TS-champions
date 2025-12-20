package com.example.football_manager.modules.match.controller;

import com.example.football_manager.modules.match.dto.*;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/champions/match")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MatchController {

    private final MatchService matchService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Match> createMatch(@RequestBody CreateMatchRequest request){
        return ResponseEntity.ok(matchService.createMatch(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/generate-schedule/{tournamentId}")
    public ResponseEntity<?> generateSchedule(@PathVariable Integer tournamentId) {
        matchService.generateGroupStageMatches(tournamentId);
        return ResponseEntity.ok("✅ Đã sinh lịch thi đấu vòng bảng thành công!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateMatchInfo(@PathVariable Integer id, @RequestBody UpdateMatchRequest req) {
        matchService.updateMatchInfo(id, req);
        return ResponseEntity.ok("Đã cập nhật thông tin trận đấu.");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/{id}/start")
    public ResponseEntity<?> startMatch(@PathVariable Integer id) {
        matchService.startMatch(id);
        return ResponseEntity.ok("Trận đấu bắt đầu! ⚽");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/events")
    public ResponseEntity<?> addEvent(@RequestBody MatchEventDTO dto){
        matchService.addEvent(dto);
        return ResponseEntity.ok("Sự kiện đã được ghi nhận");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/{id}/finish")
    public ResponseEntity<?> finishMatch(@PathVariable Integer id) {
        matchService.finishMatch(id);
        return ResponseEntity.ok("Trận đấu kết thúc. BXH đã cập nhật.");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'COACH')")
    @PostMapping("/{id}/lineup")
    public ResponseEntity<?> registerLineup(@PathVariable Integer id, @RequestBody LineupRequest req) {
        matchService.registerLineup(id, req);
        return ResponseEntity.ok("Đăng ký đội hình thành công!");
    }

    @GetMapping("/by-tournament/{tournamentId}")
    public ResponseEntity<List<MatchDetailResponse>> getMatchesByTournament(
            @PathVariable Integer tournamentId,
            @RequestParam(required = false) String groupName
    ) {

        return ResponseEntity.ok(matchService.getMatchesByTournament(tournamentId, groupName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDetailResponse> getMatchDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(matchService.getMatchDetail(id));
    }

    @GetMapping("/top-scorers")
    public ResponseEntity<List<TopScorerDTO>> getTopScorers(@RequestParam Integer tournamentId) {
        return ResponseEntity.ok(matchService.getTopScorers(tournamentId));
    }

    @PreAuthorize("hasAnyAuthority('COACH', 'ADMIN')")
    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<MatchDetailResponse>> getMatchesByTeam(@PathVariable Integer teamId) {
        return ResponseEntity.ok(matchService.getMatchesByTeam(teamId));
    }

    @GetMapping("/{matchId}/lineup/{teamId}")
    public ResponseEntity<?> getLineup(@PathVariable Integer matchId, @PathVariable Integer teamId) {

        return ResponseEntity.ok(new ArrayList<>());
    }


}