package com.example.football_manager.modules.match.service.Impl;

import com.example.football_manager.common.baseEntity.Enum.EventType;
import com.example.football_manager.common.baseEntity.Enum.MatchStatus;
import com.example.football_manager.modules.match.dto.*;
import com.example.football_manager.modules.match.entity.Match;
import com.example.football_manager.modules.match.entity.MatchEvent;
import com.example.football_manager.modules.match.entity.MatchLineup;
import com.example.football_manager.modules.match.repository.MatchEventRepository;
import com.example.football_manager.modules.match.repository.MatchLineupRepository;
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

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {
    private final MatchRepository matchRepo;
    private final MatchEventRepository eventRepo;
    private final TournamentRepository tourRepo;
    private final TeamRepository teamRepo;
    private final PlayerRepository playerRepo;
    private final TournamentTeamRepository tourTeamRepo;
    private final MatchLineupRepository matchLineupRepository;

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

    @Override
    public List<MatchDetailResponse> getMatchesByTournament(Integer tournamentId) {
        List<Match> matches = matchRepo.findByTournamentIdOrderByMatchDateAsc(tournamentId);
        return matches.stream().map(this::mapToMatchResponse).collect(Collectors.toList());
    }

    @Override
    public List<MatchDetailResponse> getPublicMatchesThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = now.with(DayOfWeek.SUNDAY).toLocalDate().atTime(LocalTime.of(23, 59, 59));
        List<Match> matches = matchRepo.findByMatchDateBetweenOrderByMatchDateAsc(startOfWeek, endOfWeek);

        return matches.stream()
                .map(this::mapToMatchDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void registerLineup(Integer matchId, LineupRequest req) {
        // 1. Xóa đội hình cũ của đội này trong trận này (nếu có đăng ký lại)
        // Lưu ý: Cần viết hàm deleteByMatchIdAndTeamId trong Repo
        matchLineupRepository.deleteByMatchIdAndTeamId(matchId, req.getTeamId());

        Match match = matchRepo.findById(matchId).orElseThrow();
        Team team = teamRepo.findById(req.getTeamId()).orElseThrow();

        // 2. Lưu Đá chính (IsStarter = true)
        for (Integer playerId : req.getStarterIds()) {
            saveLineupItem(match, team, playerId, true);
        }

        // 3. Lưu Dự bị (IsStarter = false)
        for (Integer playerId : req.getSubIds()) {
            saveLineupItem(match, team, playerId, false);
        }
    }

    @Override
    public MatchDetailResponse getMatchDetail(Integer id) {
        // 1. Tìm trận đấu theo ID
        Match match = matchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trận đấu với ID: " + id));

        // 2. Chuyển đổi Entity sang DTO (MatchDetailResponse)
        // Lưu ý: Các getter phải khớp với tên trường trong Entity của bạn
        return MatchDetailResponse.builder()
                .id(match.getId())
                .matchDate(match.getMatchDate())
                .stadium(match.getStadium())
                .roundName(match.getRoundName())
                .status(match.getStatus().name()) // Chuyển Enum thành String (SCHEDULED, LIVE, FINISHED)

                // Tỉ số
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())

                // --- THÔNG TIN ĐỘI NHÀ ---
                .homeTeamId(match.getHomeTeam().getId())
                .homeTeam(match.getHomeTeam().getName()) // Frontend gọi là match.homeTeam để lấy tên
                .homeLogo(match.getHomeTeam().getLogoUrl())

                // --- THÔNG TIN ĐỘI KHÁCH ---
                .awayTeamId(match.getAwayTeam().getId())
                .awayTeam(match.getAwayTeam().getName())
                .awayLogo(match.getAwayTeam().getLogoUrl())

                .build();
    }

    private void saveLineupItem(Match m, Team t, Integer pId, boolean isStarter) {
        MatchLineup lineup = new MatchLineup();
        lineup.setMatch(m);
        lineup.setTeam(t);
        lineup.setPlayer(playerRepo.getReferenceById(pId));
        lineup.setIsStarter(isStarter);
        matchLineupRepository.save(lineup);
    }



/// các hàm hỗ trợ

    private MatchDetailResponse mapToMatchDetailResponse(Match match) {
        MatchDetailResponse dto = new MatchDetailResponse();
        dto.setId(match.getId());

        // Map thông tin Đội nhà
        dto.setHomeTeam(match.getHomeTeam().getName());
        dto.setHomeLogo(match.getHomeTeam().getLogoUrl());

        // Map thông tin Đội khách
        dto.setAwayTeam(match.getAwayTeam().getName());
        dto.setAwayLogo(match.getAwayTeam().getLogoUrl());

        // Map thông tin Trận đấu
        dto.setMatchDate(match.getMatchDate());
        dto.setRoundName(match.getRoundName());
        dto.setStadium(match.getStadium());
        dto.setHomeScore(match.getHomeScore());
        dto.setAwayScore(match.getAwayScore());

        // Chuyển Enum thành String (SCHEDULED, LIVE, FINISHED)
        dto.setStatus(match.getStatus().name());

        return dto;
    }

    private MatchDetailResponse mapToMatchResponse(Match m) {
        MatchDetailResponse res = new MatchDetailResponse();
        res.setId(m.getId());
        res.setHomeTeam(m.getHomeTeam().getName());
        res.setHomeLogo(m.getHomeTeam().getLogoUrl());
        res.setAwayTeam(m.getAwayTeam().getName());
        res.setAwayLogo(m.getAwayTeam().getLogoUrl());
        res.setMatchDate(m.getMatchDate());
        res.setRoundName(m.getRoundName());
        res.setStadium(m.getStadium()); // Nếu Entity có trường này
        res.setHomeScore(m.getHomeScore());
        res.setAwayScore(m.getAwayScore());
        res.setStatus(m.getStatus().name());
        return res;
    }
}
