import axiosClient from './api/client';
import type { Tournament, Match, SearchMatchesParams, StandingWithGroup } from '../types';

export type { Tournament, Match, SearchMatchesParams };
export type { StandingWithGroup as Standing };

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
    getStandings: async (tournamentId: number): Promise<StandingWithGroup[]> => {
        const response = await axiosClient.get<StandingWithGroup[]>(`/champions/public/tournament/${tournamentId}/standings`);
        return response.data;
    },
};
