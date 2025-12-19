package com.example.football_manager.modules.match.repository;

import com.example.football_manager.modules.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {
    List<Match> findByTournamentId(Integer tournamentId);
    List<Match> findByTournamentIdOrderByMatchDateAsc(Integer tournamentId);
    List<Match> findByMatchDateBetweenOrderByMatchDateAsc(LocalDateTime start, LocalDateTime end);
}
