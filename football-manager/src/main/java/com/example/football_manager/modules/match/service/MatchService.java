package com.example.football_manager.modules.match.service;

import com.example.football_manager.modules.match.dto.*;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.team.dto.PlayerResponse;

import java.time.LocalDate;
import java.util.List;

public interface MatchService {

    Match createMatch(CreateMatchRequest request);

    void updateMatchInfo(Integer id, UpdateMatchRequest req);

    void startMatch(Integer id);

    void addEvent(MatchEventDTO dto);

    void finishMatch(Integer matchId);

    List<TopScorerDTO> getTopScorers(Integer tournamentId);

    List<MatchDetailResponse> getMatchesByTournament(Integer tournamentId, String groupName);

    List<MatchDetailResponse> getPublicMatchesThisWeek();

    MatchDetailResponse getMatchDetail(Integer id);

    void registerLineup(Integer matchId, LineupRequest req);

    void generateGroupStageMatches(Integer tournamentId);

    List<MatchDetailResponse> searchPublicMatches(LocalDate date, Integer tournamentId);

    List<MatchDetailResponse> getMatchesByTeam(Integer teamId);
    List<PlayerResponse> getLineupByMatch(Integer matchId, Integer teamId);
}