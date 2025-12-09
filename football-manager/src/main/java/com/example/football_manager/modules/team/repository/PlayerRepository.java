package com.example.football_manager.modules.team.repository;

import com.example.football_manager.modules.team.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByTeamId(Long teamId);
}
