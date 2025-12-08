package com.example.football_manager.modules.team.service.impl;

import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.repository.PlayerRepository;
import com.example.football_manager.modules.team.service.PlayerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PlayerServiceImpl implements PlayerService {
    @Autowired private PlayerRepository playerRepository;

    @Override
    public Player savePlayer(Player player){
        return playerRepository.save(player);
    }
}
