package com.example.football_manager.modules.team.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@Entity
@EqualsAndHashCode(callSuper = true)
public class Team extends BaseEntity {
    private String name;
    private String shortName;
    private String logoUrl;
    private String coachName;
    private String homeStadium;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    private List<Player> player;

}
