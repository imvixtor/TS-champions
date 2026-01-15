import axiosClient from './api/client';

export interface Tournament {
    id: number;
    name: string;
    season: string;
    startDate: string;
    endDate: string;
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

export interface AddTeamsRequest {
    teamIds: number[];
}

export interface ManualDrawRequest {
    groups: Array<{
        groupName: string;
        teamIds: number[];
    }>;
}

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
    getStandings: async (tournamentId: number): Promise<Standing[]> => {
        const response = await axiosClient.get<Standing[]>(`/champions/tournament/${tournamentId}/standings`);
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
