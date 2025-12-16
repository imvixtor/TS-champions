package com.example.football_manager.modules.team.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@Entity
@EqualsAndHashCode(callSuper = true)
public class Team extends BaseEntity {
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, length = 10)
    private String shortName;
    private String logoUrl;
    private String coachName;
    private String homeStadium;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    private List<Player> player;

}
