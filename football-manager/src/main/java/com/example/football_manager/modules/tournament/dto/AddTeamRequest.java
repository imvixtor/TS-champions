package com.example.football_manager.modules.tournament.dto;

import lombok.Data;

import java.util.List;

@Data
public class AddTeamRequest {
    private List<Integer> teamIds;
}
