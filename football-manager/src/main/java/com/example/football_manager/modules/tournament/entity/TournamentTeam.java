package com.example.football_manager.modules.tournament.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import com.example.football_manager.modules.team.entity.Team;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "tournament_teams")
@Data
@EqualsAndHashCode(callSuper = true)
public class TournamentTeam extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    private String groupName;

    private Integer points = 0;
    private Integer played = 0;
    private Integer won = 0;
    private Integer drawn = 0;
    private Integer lost = 0;
    private Integer goalsFor = 0;
    private Integer goalsAgainst = 0;

    // Hàm tiện ích tính hiệu số
    public Integer getGoalDifference() {
        return goalsFor - goalsAgainst;
    }
}
