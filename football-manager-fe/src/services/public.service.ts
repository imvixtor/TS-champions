import axiosClient from './api/client';

export interface Tournament {
    id: number;
    name: string;
    season: string;
    startDate: string;
    endDate: string;
}

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
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';
}

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

export interface SearchMatchesParams {
    date?: string;
    tournamentId?: number | null;
}

export const publicService = {
    /**
     * Lấy danh sách giải đấu (public)
     */
    getTournaments: async (): Promise<Tournament[]> => {
        const response = await axiosClient.get<Tournament[]>('/champions/public/tournaments');
        return response.data;
    },

    /**
     * Lấy danh sách trận đấu tuần này (public)
     */
    getWeeklyMatches: async (): Promise<Match[]> => {
        const response = await axiosClient.get<Match[]>('/champions/public/matches/weekly');
        return response.data;
    },

    /**
     * Tìm kiếm trận đấu (public)
     */
    searchMatches: async (params: SearchMatchesParams): Promise<Match[]> => {
        const response = await axiosClient.get<Match[]>('/champions/public/matches/search', {
            params: {
                date: params.date,
                tournamentId: params.tournamentId,
            },
        });
        return response.data;
    },

    /**
     * Lấy chi tiết trận đấu (public)
     */
    getMatchDetail: async (matchId: number): Promise<Match> => {
        const response = await axiosClient.get<Match>(`/champions/public/match/${matchId}`);
        return response.data;
    },

    /**
     * Lấy bảng xếp hạng (public)
     */
    getStandings: async (tournamentId: number): Promise<Standing[]> => {
        const response = await axiosClient.get<Standing[]>(`/champions/public/tournament/${tournamentId}/standings`);
        return response.data;
    },
};
