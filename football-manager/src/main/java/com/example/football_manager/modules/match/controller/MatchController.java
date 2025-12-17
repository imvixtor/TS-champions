package com.example.football_manager.modules.match.controller;

import com.example.football_manager.modules.match.dto.CreateMatchRequest;
import com.example.football_manager.modules.match.dto.MatchEventDTO;
import com.example.football_manager.modules.match.dto.TopScorerDTO;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.match.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/champions/match")
public class MatchController {
    @Autowired
    private MatchService matchService;

    @PostMapping("/create")
    public ResponseEntity<Match> createMatch(@RequestBody CreateMatchRequest request){
        return ResponseEntity.ok(matchService.CreateMatch(request));
    }

    @PostMapping("/events")
    public ResponseEntity<?> addEvent(@RequestBody MatchEventDTO dto){
        matchService.addEvent(dto);
        return ResponseEntity.ok("Sự kiện đã được ghi nhận");
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<?> finishMatch(@PathVariable Integer id) {
        matchService.finishMatch(id);
        return ResponseEntity.ok("Trận đấu kết thúc. BXH đã cập nhật.");
    }

    // 4. Xem danh sách vua phá lưới
    @GetMapping("/top-scorers")
    public ResponseEntity<List<TopScorerDTO>> getTopScorers(@RequestParam Integer tournamentId) {
        return ResponseEntity.ok(matchService.getTopScorers(tournamentId));
    }
}
