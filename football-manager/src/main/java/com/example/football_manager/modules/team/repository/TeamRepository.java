package com.example.football_manager.modules.team.repository;

import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
