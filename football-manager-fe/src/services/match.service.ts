import axiosClient from './api/client';
import type {
    Match,
    CreateMatchRequest,
    UpdateMatchRequest,
    MatchEventDTO,
} from '../types';

export type { Match, CreateMatchRequest, UpdateMatchRequest, MatchEventDTO };

export const matchService = {
    /**
     * Lấy danh sách trận đấu theo giải đấu
     */
    getMatchesByTournament: async (tournamentId: number, groupName?: string): Promise<Match[]> => {
        const url = groupName
            ? `/champions/match/by-tournament/${tournamentId}?groupName=${groupName}`
            : `/champions/match/by-tournament/${tournamentId}`;
        const response = await axiosClient.get<Match[]>(url);
        return response.data;
    },

    /**
     * Lấy danh sách trận đấu theo đội
     */
    getMatchesByTeam: async (teamId: number): Promise<Match[]> => {
        const response = await axiosClient.get<Match[]>(`/champions/match/by-team/${teamId}`);
        return response.data;
    },

    /**
     * Lấy chi tiết trận đấu
     */
    getMatchDetail: async (matchId: number): Promise<Match> => {
        const response = await axiosClient.get<Match>(`/champions/match/${matchId}`);
        return response.data;
    },

    /**
     * Tạo trận đấu mới
     */
    createMatch: async (data: CreateMatchRequest): Promise<void> => {
        await axiosClient.post('/champions/match/create', data);
    },

    /**
     * Cập nhật trận đấu
     */
    updateMatch: async (matchId: number, data: UpdateMatchRequest): Promise<void> => {
        await axiosClient.put(`/champions/match/${matchId}/update`, data);
    },

    /**
     * Sinh lịch thi đấu tự động
     */
    generateSchedule: async (tournamentId: number): Promise<void> => {
        await axiosClient.post(`/champions/match/generate-schedule/${tournamentId}`);
    },

    /**
     * Bắt đầu trận đấu
     */
    startMatch: async (matchId: number): Promise<void> => {
        await axiosClient.post(`/champions/match/${matchId}/start`);
    },

    /**
     * Kết thúc trận đấu
     */
    finishMatch: async (matchId: number): Promise<void> => {
        await axiosClient.post(`/champions/match/${matchId}/finish`);
    },

    /**
     * Thêm sự kiện trận đấu (bàn thắng, thẻ phạt, thay người)
     */
    addMatchEvent: async (data: MatchEventDTO): Promise<void> => {
        await axiosClient.post('/champions/match/events', data);
    },
};
