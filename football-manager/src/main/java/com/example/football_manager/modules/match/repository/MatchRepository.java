package com.example.football_manager.modules.match.repository;

import com.example.football_manager.modules.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {
    List<Match> findByTournamentId(Integer tournamentId);
    List<Match> findByTournamentIdOrderByMatchDateAsc(Integer tournamentId);
    List<Match> findByMatchDateBetweenOrderByMatchDateAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT m FROM Match m WHERE " +
            "(:tournamentId IS NULL OR m.tournament.id = :tournamentId) AND " +
            "m.matchDate BETWEEN :startOfDay AND :endOfDay " +
            "ORDER BY m.matchDate ASC")
    List<Match> searchMatches(@Param("tournamentId") Integer tournamentId,
                              @Param("startOfDay") LocalDateTime startOfDay,
                              @Param("endOfDay") LocalDateTime endOfDay);

    List<Match> findByHomeTeamIdOrAwayTeamIdOrderByMatchDateAsc(Integer homeTeamId, Integer awayTeamId);

    @Query("SELECT m FROM Match m WHERE m.homeTeam.id = :teamId OR m.awayTeam.id = :teamId ORDER BY m.matchDate ASC")
    List<Match> findByTeamId(@Param("teamId") Integer teamId);
}
