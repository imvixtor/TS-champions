package com.example.football_manager.modules.match.entity;


import com.example.football_manager.common.baseEntity.BaseEntity;
import com.example.football_manager.common.baseEntity.Enum.MatchStatus;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.tournament.entity.Tournament;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "matches")
public class Match extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "home_team_id")
    private Team homeTeam;

    @ManyToOne
    @JoinColumn(name = "away_team_id")
    private Team awayTeam;

    private String roundName; // Vòng 1, Tứ kết...
    private String stadium;

    private Integer homeScore = 0;
    private Integer awayScore = 0;

    @Enumerated(EnumType.STRING)
    private MatchStatus status = MatchStatus.SCHEDULED;

    private String groupName;

    @Column(name = "match_date")
    private LocalDateTime matchDate;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MatchEvent> events;
}