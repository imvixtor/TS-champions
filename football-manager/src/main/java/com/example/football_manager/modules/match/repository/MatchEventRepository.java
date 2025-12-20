package com.example.football_manager.modules.match.repository;

import com.example.football_manager.common.baseEntity.Enum.EventType;
import com.example.football_manager.modules.match.dto.TopScorerDTO;
import com.example.football_manager.modules.match.entity.MatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchEventRepository extends JpaRepository<MatchEvent, Integer> {
    long countByMatchIdAndTeamIdAndType(Integer matchId, Integer teamId, EventType type);

    @Query("SELECT new com.example.football_manager.modules.match.dto.TopScorerDTO(" +
            "p.name, t.name, p.avatarUrl, COUNT(e)) " +
            "FROM MatchEvent e " +
            "JOIN e.player p " +
            "JOIN p.team t " +
            "WHERE e.type = 'GOAL' AND e.match.tournament.id = :tourId " +
            "GROUP BY p.id, p.name, t.name, p.avatarUrl " +
            "ORDER BY COUNT(e) DESC")
    List<TopScorerDTO> findTopScorers(@Param("tourId") Integer tourId);

    List<MatchEvent> findByMatchIdOrderByMinuteAsc(Integer matchId);
}
