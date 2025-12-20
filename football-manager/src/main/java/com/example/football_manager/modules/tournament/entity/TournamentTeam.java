package com.example.football_manager.modules.tournament.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import com.example.football_manager.modules.team.entity.Team;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournament_teams")
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "gd")
    private Integer gd = 0;

    private Integer yellowCards = 0;
    private Integer redCards = 0;

    @Column(name = "is_seeded")
    private boolean isSeeded = false;

    public int getFairPlayScore() {
        return (yellowCards * 1) + (redCards * 3);
    }

    // Hàm tiện ích tính hiệu số
    public Integer getGoalDifference() {
        return goalsFor - goalsAgainst;
    }
}
