package com.example.football_manager.modules.tournament.controller;

import com.example.football_manager.modules.tournament.dto.AddTeamRequest;
import com.example.football_manager.modules.tournament.dto.StandingResponse;
import com.example.football_manager.modules.tournament.dto.TournamentRequest;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/champions/tournament")
public class TourmentController {
    @Autowired private TournamentService tournamentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Tournament> create(@RequestBody TournamentRequest request){
        return ResponseEntity.ok(tournamentService.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/add-teams")
    public ResponseEntity<?> addTeam(@PathVariable Integer id, @RequestBody AddTeamRequest addTeamRequest){
        tournamentService.addTeamsToTournament(id, addTeamRequest);
        return ResponseEntity.ok("Đã thêm đội bóng vào giải thành công");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/draw")
    public ResponseEntity<?> autoDrawGroups(@PathVariable Integer id, @RequestParam(defaultValue = "4") int groups){
        tournamentService.autoDrawGroups(id, groups);
        return ResponseEntity.ok("Đã chia bảng");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/standings")
    public ResponseEntity<List<StandingResponse>> getStandings(@PathVariable Integer id) {
        return ResponseEntity.ok(tournamentService.getStandings(id));
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.findAll());
    }
}
