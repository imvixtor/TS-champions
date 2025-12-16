package com.example.football_manager.modules.tournament.service.Impl;

import com.example.football_manager.common.baseEntity.Enum.TournamentStatus;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.TeamRepository;
import com.example.football_manager.modules.tournament.dto.AddTeamRequest;
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
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
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
    public void autoDrawGroups(Integer tournamentId, int numberOfGroups){
        List<TournamentTeam> participants = tournamentTeamRepository.findByTournamentId(tournamentId);

        if(participants.isEmpty()){
            throw new RuntimeException("Chưa có đội nào tham gia giải!");
        }

        //Random danh sách
        Collections.shuffle(participants);

        String[] groupNames = {"A", "B", "C", "D", "E", "F", "G", "H"};
        if (numberOfGroups > groupNames.length) {
            throw new RuntimeException("Hệ thống chỉ hỗ trợ tối đa 8 bảng đấu");
        }

        for (int i=0; i<participants.size(); i++){
            String assignedGroup = groupNames[i % numberOfGroups];
            TournamentTeam tt = participants.get(i);
            tt.setGroupName(assignedGroup);
        }

        tournamentTeamRepository.saveAll(participants);

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

    private StandingResponse mapToStandingResponse(TournamentTeam tt) {
        StandingResponse res = new StandingResponse();
        res.setTeamId(tt.getTeam().getId());
        res.setTeamName(tt.getTeam().getName());
        res.setTeamLogo(tt.getTeam().getLogoUrl());
        res.setGroupName(tt.getGroupName());

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
