package com.example.football_manager.modules.match.repository;

import com.example.football_manager.modules.match.entity.MatchLineup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchLineupRepository extends JpaRepository<MatchLineup, Integer> {

    List<MatchLineup> findByMatchIdAndTeamId(Integer matchId, Integer teamId);

    void deleteByMatchIdAndTeamId(Integer matchId, Integer teamId);
}
