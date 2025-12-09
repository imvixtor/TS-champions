package com.example.football_manager.modules.team.repository;

import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    boolean existsByName(String name);
    List<Team> findByNameContainingIgnoreCase(String name);
}
