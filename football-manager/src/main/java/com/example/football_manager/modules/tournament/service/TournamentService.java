package com.example.football_manager.modules.tournament.service;

import com.example.football_manager.modules.tournament.dto.AddTeamRequest;
import com.example.football_manager.modules.tournament.dto.ManualDrawRequest;
import com.example.football_manager.modules.tournament.dto.StandingResponse;
import com.example.football_manager.modules.tournament.dto.TournamentRequest;
import com.example.football_manager.modules.tournament.entity.Tournament;

import java.util.List;

public interface TournamentService {
    Tournament create(TournamentRequest request);
    Tournament getById(Integer id);

    void addTeamsToTournament(Integer tournamentId, AddTeamRequest request);

    void autoDrawGroups(Integer tournamentId, int numberOfGroups);

    List<StandingResponse> getStandings(Integer tournamentId);

    List<Tournament> findAll();

    void manualDraw(Integer tournamentId, ManualDrawRequest request);

    void toggleSeed(Integer tournamentId, Integer teamId);

    Tournament update(Integer id, TournamentRequest request);
    void delete(Integer id);
}
