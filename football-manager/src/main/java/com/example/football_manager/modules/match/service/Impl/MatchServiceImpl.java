package com.example.football_manager.modules.match.service.Impl;

import com.example.football_manager.common.baseEntity.Enum.EventType;
import com.example.football_manager.common.baseEntity.Enum.MatchStatus;
import com.example.football_manager.modules.match.dto.CreateMatchRequest;
import com.example.football_manager.modules.match.dto.MatchEventDTO;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.match.entity.MatchEvent;
import com.example.football_manager.modules.match.repository.MatchEventRepository;
import com.example.football_manager.modules.match.repository.MatchRepository;
import com.example.football_manager.modules.match.service.MatchService;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.PlayerRepository;
import com.example.football_manager.modules.team.repository.TeamRepository;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.repository.TournamentRepository;
import com.example.football_manager.modules.tournament.repository.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {
    private final MatchRepository matchRepo;
    private final MatchEventRepository eventRepo;
    private final TournamentRepository tourRepo;
    private final TeamRepository teamRepo;
    private final PlayerRepository playerRepo;
    private final TournamentTeamRepository tourTeamRepo;

    @Override
    public Match CreateMatch(CreateMatchRequest request){
        Tournament tournament = tourRepo.findById(request.getTournamentId()).orElseThrow();
        Team home = teamRepo.findById(request.getHomeTeamId()).orElseThrow();
        Team away = teamRepo.findById(request.getAwayTeamId()).orElseThrow();

        Match match = new Match();
        match.setTournament(tournament);
        match.setHomeTeam(home);
        match.setAwayTeam(away);
        match.setMatchDate(request.getMatchDate());
        match.setRoundName(request.getRoundName());
        match.setStatus(MatchStatus.SCHEDULED);

        return matchRepo.save(match);
    }

    @Override
    public void addEvent(MatchEventDTO dto){
        Match match = matchRepo.findById(dto.getMatchId())
                .orElseThrow(() -> new RuntimeException("Match not found"));

    if(match.getStatus() == MatchStatus.FINISHED){
        throw new RuntimeException("Không thể thêm trận đấy khi đã kết thúc");
    }

        MatchEvent event = new MatchEvent();
        event.setMatch(match);
        event.setTeam(teamRepo.getReferenceById(dto.getTeamId()));
        event.setPlayer(playerRepo.getReferenceById(dto.getPlayerId()));
        event.setType(dto.getType());
        event.setMinute(dto.getMinute());

        eventRepo.save(event);

        if(dto.getType() == EventType.GOAL){
            if (match.getHomeTeam().getId().equals(dto.getTeamId())){
                match.setHomeScore(match.getHomeScore() + 1);
            }else {
                match.setAwayScore(match.getAwayScore() + 1);
            }
            match.setStatus(MatchStatus.LIVE);
            matchRepo.save(match);
        }
    }
}
