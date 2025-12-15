package com.example.football_manager.modules.tournament.repository;

import com.example.football_manager.modules.tournament.entity.TournamentTeam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentTeamRepository extends JpaRepository<Long, TournamentTeam> {
}
