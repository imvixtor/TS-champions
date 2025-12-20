package com.example.football_manager.modules.match.entity;

import com.example.football_manager.common.baseEntity.BaseEntity;
import com.example.football_manager.common.baseEntity.Enum.EventType;
import com.example.football_manager.modules.team.entity.Player;
import com.example.football_manager.modules.team.entity.Team;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "match_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchEvent extends BaseEntity {
    @ManyToOne
    private Match match;

    @ManyToOne
    private Team team; // Đội thực hiện sự kiện

    @ManyToOne
    private Player player; // Cầu thủ (Ghi bàn/Thẻ/Vào sân)

    @Enumerated(EnumType.STRING)
    private EventType type;

    private Integer minute;

}
