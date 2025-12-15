package com.example.football_manager.modules.tournament.repository;

import com.example.football_manager.modules.tournament.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TournamentRepository extends JpaRepository<Long, Tournament> {
}
