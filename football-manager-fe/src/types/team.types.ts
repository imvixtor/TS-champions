// Team related types
export interface Team {
    id: number;
    name: string;
    shortName: string;
    stadium: string;
    logo: string;
    logoUrl?: string; // Alternative field name used in some places
    coachName?: string;
}

// Simplified Team interface for tournament pages
export interface TeamBasic {
    id: number;
    name: string;
    logo: string;
}

export interface CreateTeamRequest {
    name: string;
    shortName: string;
    stadium: string;
    coachName?: string;
}

export interface UpdateTeamRequest {
    name: string;
    shortName: string;
    stadium: string;
    coachName?: string;
}

export interface CreateCoachRequest {
    teamId: number;
    username: string;
    password: string;
}
