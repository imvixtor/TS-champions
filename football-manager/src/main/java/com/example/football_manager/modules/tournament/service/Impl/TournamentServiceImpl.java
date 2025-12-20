package com.example.football_manager.modules.tournament.service.Impl;

import com.example.football_manager.common.baseEntity.Enum.TournamentStatus;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.TeamRepository;
import com.example.football_manager.modules.tournament.dto.AddTeamRequest;
import com.example.football_manager.modules.tournament.dto.ManualDrawRequest;
import com.example.football_manager.modules.tournament.dto.StandingResponse;
import com.example.football_manager.modules.tournament.dto.TournamentRequest;
import com.example.football_manager.modules.tournament.entity.Tournament;
import com.example.football_manager.modules.tournament.entity.TournamentTeam;
import com.example.football_manager.modules.tournament.repository.TournamentRepository;
import com.example.football_manager.modules.tournament.repository.TournamentTeamRepository;
import com.example.football_manager.modules.tournament.service.TournamentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;
    private final TournamentTeamRepository tournamentTeamRepository;
    private final TeamRepository teamRepository;

    @Override
    public Tournament create(TournamentRequest request){
        Tournament t = new Tournament();
        t.setName(request.getName());
        t.setStartDate(request.getStartDate());
        t.setEndDate(request.getEndDate());
        t.setStatus(TournamentStatus.PLANNING);
        return tournamentRepository.save(t);
    }

    @Override
    public Tournament getById(Integer id){
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("giải đấu không có"));
    }

    @Override
    @Transactional
    public void addTeamsToTournament(Integer tournamentId, AddTeamRequest request){
        Tournament tournament = getById(tournamentId);

        for (Integer teamId : request.getTeamIds()){
            if (tournamentTeamRepository.existsByTournamentIdAndTeamId(tournamentId, teamId)){
                continue;
            }

            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team ID" + teamId + "not found"));

            TournamentTeam tt = new TournamentTeam();
            tt.setTournament(tournament);
            tt.setTeam(team);
            tournamentTeamRepository.save(tt);
        }
    }


    @Override
    @Transactional
    public void autoDrawGroups(Integer tournamentId, int groupCount) {
        List<TournamentTeam> allTeams = tournamentTeamRepository.findByTournamentId(tournamentId);

        if (allTeams.isEmpty()) return;

        List<TournamentTeam> seeds = allTeams.stream().filter(TournamentTeam::isSeeded).collect(Collectors.toList());
        List<TournamentTeam> regulars = allTeams.stream().filter(t -> !t.isSeeded()).collect(Collectors.toList());

        Collections.shuffle(seeds);
        Collections.shuffle(regulars);

        List<String> groupNames = new ArrayList<>();
        for (int i = 0; i < groupCount; i++) {
            groupNames.add("Group " + (char)('A' + i));
        }

        int groupIndex = 0;
        for (TournamentTeam seed : seeds) {
            seed.setGroupName(groupNames.get(groupIndex));
            tournamentTeamRepository.save(seed);

            groupIndex = (groupIndex + 1) % groupCount;
        }

        for (TournamentTeam reg : regulars) {
            reg.setGroupName(groupNames.get(groupIndex));
            tournamentTeamRepository.save(reg);

            groupIndex = (groupIndex + 1) % groupCount;
        }
    }

    @Override
    public List<StandingResponse> getStandings(Integer tournamentId){
        List<TournamentTeam> list = tournamentTeamRepository.findByTournamentId(tournamentId);

        Collections.sort(list, new Comparator<TournamentTeam>() {
            @Override
            public int compare(TournamentTeam t1, TournamentTeam t2) {
                int pointsCompare = t2.getPoints().compareTo(t1.getPoints());
                if (pointsCompare != 0) return pointsCompare;

                int gdCompare = Integer.compare(t2.getGoalDifference(), t1.getGoalDifference());
                if (gdCompare != 0) return gdCompare;

                int goalsCompare = t2.getGoalsFor().compareTo(t1.getGoalsFor());
                if (goalsCompare != 0) return goalsCompare;

                int fpCompare = Integer.compare(t1.getFairPlayScore(), t2.getFairPlayScore());
                if (fpCompare != 0) return fpCompare;

                return t1.getTeam().getName().compareToIgnoreCase(t2.getTeam().getName());
            }
        });

        return list.stream().map(this::mapToStandingResponse).collect(Collectors.toList());
    }

    @Override
    public List<Tournament> findAll(){
        return tournamentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Override
    public void manualDraw(Integer tournamentId, ManualDrawRequest request) {
        TournamentTeam tt = tournamentTeamRepository.findByTournamentIdAndTeamId(tournamentId, request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Đội bóng này chưa được thêm vào giải đấu!"));

        tt.setGroupName(request.getGroupName());
        tournamentTeamRepository.save(tt);
    }

    @Override
    @Transactional
    public void toggleSeed(Integer tournamentId, Integer teamId) {
        TournamentTeam tt = tournamentTeamRepository.findByTournamentIdAndTeamId(tournamentId, teamId)
                .orElseThrow(() -> new RuntimeException("Đội bóng không tồn tại trong giải!"));

        tt.setSeeded(!tt.isSeeded());
        tournamentTeamRepository.save(tt);
    }

    // ... (Các phần cũ giữ nguyên)

    @Override
    public Tournament update(Integer id, TournamentRequest request) {
        Tournament t = getById(id); // Hàm này đã check tồn tại rồi
        t.setName(request.getName());
        t.setStartDate(request.getStartDate());
        t.setEndDate(request.getEndDate());
//        t.setStatus(request.getStatus());

        return tournamentRepository.save(t);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        if (!tournamentRepository.existsById(id)) {
            throw new RuntimeException("Giải đấu không tồn tại");
        }

        List<TournamentTeam> relatedTeams = tournamentTeamRepository.findByTournamentId(id);
        tournamentTeamRepository.deleteAll(relatedTeams);

        // matchRepository.deleteByTournamentId(id);

        tournamentRepository.deleteById(id);
    }

    private StandingResponse mapToStandingResponse(TournamentTeam tt) {
        StandingResponse res = new StandingResponse();
        res.setTeamId(tt.getTeam().getId());
        res.setTeamName(tt.getTeam().getName());
        res.setTeamLogo(tt.getTeam().getLogoUrl());
        res.setGroupName(tt.getGroupName());
        res.setSeeded(tt.isSeeded());

        res.setPoints(tt.getPoints());
        res.setPlayed(tt.getPlayed());
        res.setWon(tt.getWon());
        res.setDrawn(tt.getDrawn());
        res.setLost(tt.getLost());

        res.setGd(tt.getGoalDifference());

        // Map thêm phần thẻ phạt
        res.setYellowCards(tt.getYellowCards());
        res.setRedCards(tt.getRedCards());
        res.setFairPlayScore(tt.getFairPlayScore());

        return res;
    }
}
