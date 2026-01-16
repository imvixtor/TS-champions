// Standing related types
// Basic standing from API (used in tournament.service for basic standings)
export interface Standing {
    teamId: number;
    teamName: string;
    teamLogo: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
}

// Standing with group name (used in public pages and tournament pages)
// API returns gd instead of goalDifference for grouped standings
export interface StandingWithGroup {
    teamId: number;
    teamName: string;
    teamLogo: string;
    groupName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gd: number; // Goal difference (shorter name, matches API response)
    points: number;
}

// Standing for tournament admin (with seeding info and simplified fields)
export interface TournamentStanding {
    teamId: number;
    teamName: string;
    teamLogo: string;
    groupName: string;
    isSeeded: boolean;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gd: number; // Goal difference (shorter name)
}
