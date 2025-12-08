package com.example.football_manager.modules.tournament.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Tournament extends BaseEntity {
    private String name;
}
