import axiosClient from './api/client';
import type {
    Tournament,
    CreateTournamentRequest,
    UpdateTournamentRequest,
    AddTeamsRequest,
    ManualDrawRequest,
} from '../types/tournament.types';
import type { TournamentStanding } from '../types/standing.types';

export type {
    Tournament,
    CreateTournamentRequest,
    UpdateTournamentRequest,
    AddTeamsRequest,
    ManualDrawRequest,
};
export type { TournamentStanding as Standing };

export const tournamentService = {
    /**
     * Lấy danh sách tất cả giải đấu
     */
    getAllTournaments: async (): Promise<Tournament[]> => {
        const response = await axiosClient.get<Tournament[]>('/champions/tournament');
        return response.data;
    },

    /**
     * Tạo giải đấu mới
     */
    createTournament: async (data: CreateTournamentRequest): Promise<void> => {
        await axiosClient.post('/champions/tournament/create', data);
    },

    /**
     * Cập nhật giải đấu
     */
    updateTournament: async (tournamentId: number, data: UpdateTournamentRequest): Promise<void> => {
        await axiosClient.put(`/champions/tournament/update/${tournamentId}`, data);
    },

    /**
     * Xóa giải đấu
     */
    deleteTournament: async (tournamentId: number): Promise<void> => {
        await axiosClient.delete(`/champions/tournament/delete/${tournamentId}`);
    },

    /**
     * Lấy bảng xếp hạng
     */
    getStandings: async (tournamentId: number): Promise<TournamentStanding[]> => {
        const response = await axiosClient.get<TournamentStanding[]>(`/champions/tournament/${tournamentId}/standings`);
        return response.data;
    },

    /**
     * Thêm đội vào giải đấu
     */
    addTeams: async (tournamentId: number, data: AddTeamsRequest): Promise<void> => {
        await axiosClient.post(`/champions/tournament/${tournamentId}/add-teams`, data);
    },

    /**
     * Toggle seed cho đội
     */
    toggleSeed: async (tournamentId: number, teamId: number): Promise<void> => {
        await axiosClient.post(`/champions/tournament/${tournamentId}/toggle-seed`, null, {
            params: { teamId },
        });
    },

    /**
     * Tự động chia bảng
     */
    autoDraw: async (tournamentId: number): Promise<void> => {
        await axiosClient.post(`/champions/tournament/${tournamentId}/draw`, null);
    },

    /**
     * Chia bảng thủ công
     */
    manualDraw: async (tournamentId: number, data: ManualDrawRequest): Promise<void> => {
        await axiosClient.post(`/champions/tournament/${tournamentId}/manual-draw`, data);
    },
};
