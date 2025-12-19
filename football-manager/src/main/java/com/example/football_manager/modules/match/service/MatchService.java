package com.example.football_manager.modules.match.service;


import com.example.football_manager.modules.match.dto.*;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.team.entity.Team;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MatchService {
    Match CreateMatch(CreateMatchRequest request);
    void addEvent(MatchEventDTO dto);

    void finishMatch(Integer matchId);

    List<TopScorerDTO> getTopScorers(Integer tournamentId);

    List<MatchDetailResponse> getMatchesByTournament(Integer tournamentId);
    List<MatchDetailResponse> getPublicMatchesThisWeek();

    void registerLineup(Integer matchId, LineupRequest req);

    MatchDetailResponse getMatchDetail(Integer id);
}
