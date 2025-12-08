package com.example.football_manager.modules.team.repository;

import com.example.football_manager.modules.team.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Long> {
}
