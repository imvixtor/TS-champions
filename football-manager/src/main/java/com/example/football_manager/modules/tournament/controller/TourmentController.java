package com.example.football_manager.modules.tournament.controller;

import com.example.football_manager.modules.tournament.dto.AddTeamRequest;
import com.example.football_manager.modules.tournament.dto.ManualDrawRequest;
import com.example.football_manager.modules.tournament.dto.StandingResponse;
import com.example.football_manager.modules.tournament.dto.TournamentRequest;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/champions/tournament")
@RequiredArgsConstructor
public class TourmentController {
    private final TournamentService tournamentService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Tournament> create(@RequestBody TournamentRequest request){
        return ResponseEntity.ok(tournamentService.create(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/{id}/add-teams")
    public ResponseEntity<?> addTeam(@PathVariable Integer id, @RequestBody AddTeamRequest addTeamRequest){
        tournamentService.addTeamsToTournament(id, addTeamRequest);
        return ResponseEntity.ok("Đã thêm đội bóng vào giải thành công");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/{id}/draw")
    public ResponseEntity<?> autoDrawGroups(@PathVariable Integer id, @RequestParam(defaultValue = "4") int groups){
        tournamentService.autoDrawGroups(id, groups);
        return ResponseEntity.ok("Đã chia bảng");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/{id}/standings")
    public ResponseEntity<List<StandingResponse>> getStandings(@PathVariable Integer id) {
        return ResponseEntity.ok(tournamentService.getStandings(id));
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.findAll());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/{id}/manual-draw")
    public ResponseEntity<?> manualDraw(@PathVariable Integer id, @RequestBody ManualDrawRequest request) {
        tournamentService.manualDraw(id, request);
        return ResponseEntity.ok("Đã cập nhật bảng đấu thành công!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/{id}/toggle-seed")
    public ResponseEntity<?> toggleSeed(@PathVariable Integer id, @RequestParam Integer teamId) {
        tournamentService.toggleSeed(id, teamId);
        return ResponseEntity.ok("Đã thay đổi trạng thái hạt giống!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Tournament> update(@PathVariable Integer id, @RequestBody TournamentRequest request) {
        return ResponseEntity.ok(tournamentService.update(id, request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        tournamentService.delete(id);
        return ResponseEntity.ok("Đã xóa giải đấu thành công!");
    }
}
