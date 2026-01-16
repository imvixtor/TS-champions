// Match related types
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';

export interface Match {
    id: number;
    homeTeamId: number;
    homeTeam: string;
    homeLogo: string;
    awayTeamId: number;
    awayTeam: string;
    awayLogo: string;
    matchDate: string;
    roundName: string;
    groupName: string;
    stadium: string;
    homeScore: number;
    awayScore: number;
    status: MatchStatus;
}

export interface CreateMatchRequest {
    tournamentId: number;
    homeTeamId: number;
    awayTeamId: number;
    matchDate: string;
    stadium: string;
    roundName: string;
}

export interface UpdateMatchRequest {
    matchDate: string;
    stadium: string;
    status?: MatchStatus;
}

export interface MatchEventDTO {
    matchId: number;
    playerId: number;
    eventType: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
    minute: number;
    teamId: number;
}

export interface SearchMatchesParams {
    date?: string;
    tournamentId?: number | null;
}

// Match with events (for match detail modal)
export interface MatchEvent {
    id?: number;
    playerId: number;
    playerName: string;
    playerNumber?: number;
    teamId: number;
    type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
    minute: number;
}

export interface MatchWithEvents extends Match {
    events?: MatchEvent[];
}

// Component props
export interface MatchDetailProps {
    matchId: number;
    onClose: () => void;
}
