package com.example.football_manager.modules.tournament.dto;

import lombok.Data;

@Data
public class ManualDrawRequest {
    private Integer teamId;
    private String groupName;
}