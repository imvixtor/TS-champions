// Tournament related types
export interface Tournament {
    id: number;
    name: string;
    season: string;
    startDate: string;
    endDate: string;
}

// Simplified Tournament interface for some pages
export interface TournamentBasic {
    id: number;
    name: string;
    season: string;
}

export interface CreateTournamentRequest {
    name: string;
    season: string;
    startDate: string;
    endDate: string;
}

export interface UpdateTournamentRequest {
    name: string;
    season: string;
    startDate: string;
    endDate: string;
}

export interface AddTeamsRequest {
    teamIds: number[];
}

export interface ManualDrawRequest {
    groups: Array<{
        groupName: string;
        teamIds: number[];
    }>;
}
