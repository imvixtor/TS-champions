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
import com.example.football_manager.modules.team.dto.PlayerResponse;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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
    public Match createMatch(CreateMatchRequest request){
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
        match.setHomeScore(0);
        match.setAwayScore(0);

        return matchRepo.save(match);
    }

    @Override
    public void updateMatchInfo(Integer id, UpdateMatchRequest req) {
        Match match = matchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trận đấu"));

        if (req.getMatchDate() != null) match.setMatchDate(req.getMatchDate());
        if (req.getStadium() != null) match.setStadium(req.getStadium());

        if (req.getHomeScore() != null) match.setHomeScore(req.getHomeScore());
        if (req.getAwayScore() != null) match.setAwayScore(req.getAwayScore());

        if (req.getStatus() != null) match.setStatus(req.getStatus());

        matchRepo.save(match);
    }

    @Override
    public void startMatch(Integer id) {
        Match match = matchRepo.findById(id).orElseThrow();
        if (match.getStatus() != MatchStatus.SCHEDULED) {
            throw new RuntimeException("Trận đấu đã bắt đầu hoặc đã kết thúc!");
        }
        match.setStatus(MatchStatus.IN_PROGRESS);
        matchRepo.save(match);
    }

    @Override
    @Transactional
    public void addEvent(MatchEventDTO dto){
        Match match = matchRepo.findById(dto.getMatchId())
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if(match.getStatus() == MatchStatus.FINISHED){
            throw new RuntimeException("Không thể thêm sự kiện khi trận đấu đã kết thúc");
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
            } else {
                match.setAwayScore(match.getAwayScore() + 1);
            }

            if (match.getStatus() == MatchStatus.SCHEDULED) {
                match.setStatus(MatchStatus.IN_PROGRESS);
            }
            matchRepo.save(match);
        }
    }

    @Override
    @Transactional
    public void finishMatch(Integer matchId) {
        Match match = matchRepo.findById(matchId).orElseThrow();

        if (match.getStatus() == MatchStatus.FINISHED) return;

        match.setStatus(MatchStatus.FINISHED);
        matchRepo.save(match);

        /// --- CẬP NHẬT BẢNG XẾP HẠNG (BXH) ---
        updateTournamentTeamStats(match, match.getHomeTeam(), true);
        updateTournamentTeamStats(match, match.getAwayTeam(), false);
    }

    @Override
    public List<MatchDetailResponse> getMatchesByTournament(Integer tournamentId, String groupName) {
        List<Match> matches;

        if (groupName != null && !groupName.isEmpty()) {

            matches = matchRepo.findByTournamentIdOrderByMatchDateAsc(tournamentId).stream()
                    .filter(m -> groupName.equals(m.getGroupName()))
                    .collect(Collectors.toList());
        } else {
            matches = matchRepo.findByTournamentIdOrderByMatchDateAsc(tournamentId);
        }

        return matches.stream().map(this::mapToMatchDetailResponse).collect(Collectors.toList());
    }

    @Override
    public MatchDetailResponse getMatchDetail(Integer id) {
        Match match = matchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trận đấu với ID: " + id));

        return mapToMatchDetailResponse(match);
    }

    @Override
    @Transactional
    public void registerLineup(Integer matchId, LineupRequest req) {
        matchLineupRepository.deleteByMatchIdAndTeamId(matchId, req.getTeamId());

        Match match = matchRepo.findById(matchId).orElseThrow();
        Team team = teamRepo.findById(req.getTeamId()).orElseThrow();

        for (Integer playerId : req.getStarterIds()) {
            saveLineupItem(match, team, playerId, true);
        }
        for (Integer playerId : req.getSubIds()) {
            saveLineupItem(match, team, playerId, false);
        }
    }

    @Override
    @Transactional
    public void generateGroupStageMatches(Integer tournamentId) {
        List<TournamentTeam> allTeams = tourTeamRepo.findByTournamentId(tournamentId);

        Map<String, List<Team>> teamsByGroup = allTeams.stream()
                .collect(Collectors.groupingBy(
                        TournamentTeam::getGroupName,
                        Collectors.mapping(TournamentTeam::getTeam, Collectors.toList())
                ));

        Tournament tournament = tourRepo.findById(tournamentId).orElseThrow();

        for (Map.Entry<String, List<Team>> entry : teamsByGroup.entrySet()) {
            String groupName = entry.getKey();
            List<Team> teams = entry.getValue();
            if (groupName == null || groupName.equals("Chưa chia bảng")) continue;

            createRoundRobinSchedule(tournament, groupName, teams);
        }
    }

    @Override
    public List<TopScorerDTO> getTopScorers(Integer tournamentId) {
        return eventRepo.findTopScorers(tournamentId);
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
    public List<MatchDetailResponse> searchPublicMatches(LocalDate date, Integer tournamentId) {
        // Nếu không chọn ngày, mặc định lấy ngày hôm nay
        if (date == null) date = LocalDate.now();

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Match> matches = matchRepo.searchMatches(tournamentId, startOfDay, endOfDay);

        return matches.stream()
                .map(this::mapToMatchDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchDetailResponse> getMatchesByTeam(Integer teamId) {
        List<Match> matches = matchRepo.findByTeamId(teamId);

        return matches.stream()
                .map(this::mapToMatchDetailResponse) // Hàm map bạn đã có
                .toList();
    }

    @Override
    public List<PlayerResponse> getLineupByMatch(Integer matchId, Integer teamId) {

        return new ArrayList<>();
    }

    // ================== CÁC HÀM HỖ TRỢ (PRIVATE) ==================

    private void updateTournamentTeamStats(Match match, Team team, boolean isHome) {
        TournamentTeam tt = tourTeamRepo.findByTournamentIdAndTeamId(
                        match.getTournament().getId(), team.getId())
                .orElseThrow(() -> new RuntimeException("Đội bóng không thuộc giải đấu này"));

        tt.setPlayed(safe(tt.getPlayed()) + 1);

        int goalsScored = isHome ? match.getHomeScore() : match.getAwayScore();
        int goalsConceded = isHome ? match.getAwayScore() : match.getHomeScore();

        tt.setGoalsFor(safe(tt.getGoalsFor()) + goalsScored);
        tt.setGoalsAgainst(safe(tt.getGoalsAgainst()) + goalsConceded);
        tt.setGd(safe(tt.getGoalsFor()) - safe(tt.getGoalsAgainst()));

        if (goalsScored > goalsConceded) {
            tt.setWon(safe(tt.getWon()) + 1);
            tt.setPoints(safe(tt.getPoints()) + 3);
        } else if (goalsScored == goalsConceded) {
            tt.setDrawn(safe(tt.getDrawn()) + 1);
            tt.setPoints(safe(tt.getPoints()) + 1);
        } else {
            tt.setLost(safe(tt.getLost()) + 1);
        }

        long yellow = eventRepo.countByMatchIdAndTeamIdAndType(match.getId(), team.getId(), EventType.YELLOW_CARD);
        long red = eventRepo.countByMatchIdAndTeamIdAndType(match.getId(), team.getId(), EventType.RED_CARD);

        tt.setYellowCards(safe(tt.getYellowCards()) + (int)yellow);
        tt.setRedCards(safe(tt.getRedCards()) + (int)red);

        tourTeamRepo.save(tt);
    }

    private void createRoundRobinSchedule(Tournament tournament, String groupName, List<Team> teams) {
        int numTeams = teams.size();
        if (numTeams < 2) return;

        if (numTeams % 2 != 0) {
            teams.add(null);
            numTeams++;
        }

        int numRounds = numTeams - 1;
        int halfSize = numTeams / 2;

        List<Team> rotatingTeams = new ArrayList<>(teams);
        Team fixedTeam = rotatingTeams.remove(0);

        LocalDateTime startDate = tournament.getStartDate().atTime(19, 0);

        for (int round = 0; round < numRounds; round++) {
            String roundName = "Vòng " + (round + 1);
            LocalDateTime roundDate = startDate.plusDays(round * 7); // Mỗi vòng cách nhau 1 tuần

            int teamIdx = round % rotatingTeams.size();
            Team p2 = rotatingTeams.get(teamIdx);
            if (p2 != null) {
                createMatchEntity(tournament, fixedTeam, p2, groupName, roundName, roundDate);
            }

            for (int i = 1; i < halfSize; i++) {
                int firstTeamIdx = (round + i) % rotatingTeams.size();
                int secondTeamIdx = (round + rotatingTeams.size() - i) % rotatingTeams.size();

                Team t1 = rotatingTeams.get(firstTeamIdx);
                Team t2 = rotatingTeams.get(secondTeamIdx);

                if (t1 != null && t2 != null) {
                    createMatchEntity(tournament, t1, t2, groupName, roundName, roundDate);
                }
            }
        }
    }

    private void createMatchEntity(Tournament t, Team home, Team away, String group, String round, LocalDateTime time) {
        Match match = new Match();
        match.setTournament(t);
        match.setHomeTeam(home);
        match.setAwayTeam(away);
        match.setGroupName(group);
        match.setRoundName(round);
        match.setMatchDate(time);
        match.setStatus(MatchStatus.SCHEDULED);
        match.setHomeScore(0);
        match.setAwayScore(0);
        matchRepo.save(match);
    }

    private void saveLineupItem(Match m, Team t, Integer pId, boolean isStarter) {
        MatchLineup lineup = new MatchLineup();
        lineup.setMatch(m);
        lineup.setTeam(t);
        lineup.setPlayer(playerRepo.getReferenceById(pId));
        lineup.setIsStarter(isStarter);
        matchLineupRepository.save(lineup);
    }

    private int safe(Integer value) {
        return value == null ? 0 : value;
    }

    private MatchDetailResponse mapToMatchDetailResponse(Match match) {
        MatchDetailResponse response = new MatchDetailResponse();

        response.setId(match.getId());
        response.setMatchDate(match.getMatchDate());
        response.setStadium(match.getStadium());
        response.setStatus(match.getStatus().name());

        response.setHomeScore(match.getHomeScore() != null ? match.getHomeScore() : 0);
        response.setAwayScore(match.getAwayScore() != null ? match.getAwayScore() : 0);

        if (match.getHomeTeam() != null) {
            response.setHomeTeamId(match.getHomeTeam().getId());
            response.setHomeTeam(match.getHomeTeam().getName());
            response.setHomeLogo(match.getHomeTeam().getLogoUrl());
        } else {
            response.setHomeTeamId(0);
            response.setHomeTeam("Đội ẩn");
            response.setHomeLogo(null);
        }

        if (match.getAwayTeam() != null) {
            response.setAwayTeamId(match.getAwayTeam().getId());
            response.setAwayTeam(match.getAwayTeam().getName());
            response.setAwayLogo(match.getAwayTeam().getLogoUrl());
        } else {
            response.setAwayTeamId(0);
            response.setAwayTeam("Đội ẩn");
            response.setAwayLogo(null);
        }

        if (match.getEvents() != null) {
            response.setEvents(match.getEvents().stream()
                    .filter(evt -> evt.getTeam() != null && evt.getPlayer() != null) // Lọc sự kiện rác
                    .map(evt -> new MatchEventResponse(
                            evt.getType(),
                            evt.getMinute(),
                            evt.getTeam().getId(),
                            evt.getPlayer().getName(),
                            evt.getPlayer().getShirtNumber()
                    ))
                    .sorted(Comparator.comparing(MatchEventResponse::getMinute))
                    .collect(Collectors.toList()));
        } else {
            response.setEvents(new ArrayList<>());
        }

        return response;
    }

    // Tôi đã hợp nhất 2 hàm map trùng lặp thành 1 hàm mapToMatchDetailResponse duy nhất để code gọn hơn
    private MatchDetailResponse mapToMatchResponse(Match m) {
        return mapToMatchDetailResponse(m);
    }
}