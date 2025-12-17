package com.example.football_manager.modules.match.service.Impl;

import com.example.football_manager.common.baseEntity.Enum.EventType;
import com.example.football_manager.common.baseEntity.Enum.MatchStatus;
import com.example.football_manager.modules.match.dto.CreateMatchRequest;
import com.example.football_manager.modules.match.dto.MatchEventDTO;
import com.example.football_manager.modules.match.dto.TopScorerDTO;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.match.entity.MatchEvent;
import com.example.football_manager.modules.match.repository.MatchEventRepository;
import com.example.football_manager.modules.match.repository.MatchRepository;
import com.example.football_manager.modules.match.service.MatchService;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.PlayerRepository;
import com.example.football_manager.modules.team.repository.TeamRepository;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.entity.TournamentTeam;
import com.example.football_manager.modules.tournament.repository.TournamentRepository;
import com.example.football_manager.modules.tournament.repository.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


    @Override
    @Transactional
    public void finishMatch(Integer matchId) {
        Match match = matchRepo.findById(matchId).orElseThrow();

        if (match.getStatus() == MatchStatus.FINISHED) return; // Tránh update 2 lần

        match.setStatus(MatchStatus.FINISHED);
        matchRepo.save(match);

        // --- CẬP NHẬT BẢNG XẾP HẠNG (BXH) ---
        updateTournamentTeamStats(match, match.getHomeTeam(), true);
        updateTournamentTeamStats(match, match.getAwayTeam(), false);
    }


    // Hàm cập nhật chỉ số cho từng đội trong BXH
    private void updateTournamentTeamStats(Match match, Team team, boolean isHome) {
        TournamentTeam tt = tourTeamRepo.findByTournamentIdAndTeamId(
                        match.getTournament().getId(), team.getId())
                .orElseThrow(() -> new RuntimeException("Đội bóng không thuộc giải đấu này"));

        // 1. Cập nhật chỉ số cơ bản
        tt.setPlayed(tt.getPlayed() + 1);

        int goalsScored = isHome ? match.getHomeScore() : match.getAwayScore();
        int goalsConceded = isHome ? match.getAwayScore() : match.getHomeScore();

        tt.setGoalsFor(tt.getGoalsFor() + goalsScored);
        tt.setGoalsAgainst(tt.getGoalsAgainst() + goalsConceded);

        // 2. Tính điểm (Thắng 3, Hòa 1, Thua 0)
        if (goalsScored > goalsConceded) {
            tt.setWon(tt.getWon() + 1);
            tt.setPoints(tt.getPoints() + 3);
        } else if (goalsScored == goalsConceded) {
            tt.setDrawn(tt.getDrawn() + 1);
            tt.setPoints(tt.getPoints() + 1);
        } else {
            tt.setLost(tt.getLost() + 1);
        }

        // 3. Cập nhật thẻ phạt (Tính Fair Play)
        long yellow = eventRepo.countByMatchIdAndTeamIdAndType(match.getId(), team.getId(), EventType.YELLOW_CARD);
        long red = eventRepo.countByMatchIdAndTeamIdAndType(match.getId(), team.getId(), EventType.RED_CARD);

        tt.setYellowCards(tt.getYellowCards() + (int)yellow);
        tt.setRedCards(tt.getRedCards() + (int)red);

        tourTeamRepo.save(tt);
    }

    @Override
    public List<TopScorerDTO> getTopScorers(Integer tournamentId) {
        return eventRepo.findTopScorers(tournamentId);
    }
}
