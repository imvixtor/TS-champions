package com.example.football_manager.modules.tournament.repository;

import com.example.football_manager.modules.tournament.entity.TournamentTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TournamentTeamRepository extends JpaRepository<TournamentTeam, Integer> {
    List<TournamentTeam> findByTournamentId(Integer tournamentId);

    // Kiểm tra đội đã tồn tại trong giải chưa
    boolean existsByTournamentIdAndTeamId(Integer tournamentId, Integer teamId);

    Optional<TournamentTeam> findByTournamentIdAndTeamId(Integer tournamentId, Integer teamId);
}
