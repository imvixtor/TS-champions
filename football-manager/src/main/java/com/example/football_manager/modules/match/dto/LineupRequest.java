package com.example.football_manager.modules.match.dto;

import lombok.Data;

import java.util.List;

@Data
public class LineupRequest {
    private Integer teamId;
    private List<Integer> starterIds;
    private List<Integer> subIds;
}
