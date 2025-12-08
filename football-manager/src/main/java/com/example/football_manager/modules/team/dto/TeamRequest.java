package com.example.football_manager.modules.team.dto;

import com.example.football_manager.modules.team.entity.Player;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamRequest {
    private String name;
    private String shortName;
    private String coachName;
    private String homeStadium;


}
