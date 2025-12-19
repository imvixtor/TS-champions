package com.example.football_manager.modules.match.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.entity.Team;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "match_lineups")
@Data
@EqualsAndHashCode(callSuper = true)
public class MatchLineup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id")
    private Player player;

    // true: Đá chính, false: Dự bị
    private Boolean isStarter;

    // Điểm số chấm sau trận (VD: 8.5). Mặc định là null chưa chấm
    private Double rating;
}