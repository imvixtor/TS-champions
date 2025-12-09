package com.example.football_manager.modules.team.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import com.example.football_manager.common.baseEntity.Enum.Position;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Player extends BaseEntity {
    @Column(nullable = false)
    private String name;
    private Integer shirtNumber;

    @Enumerated(EnumType.STRING)
    private Position position;

    private String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
