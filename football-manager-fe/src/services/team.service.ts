import axiosClient from './api/client';

export interface Team {
    id: number;
    name: string;
    shortName: string;
    stadium: string;
    logo: string;
    coachName?: string;
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

export const teamService = {
    /**
     * Lấy danh sách tất cả đội bóng
     */
    getAllTeams: async (): Promise<Team[]> => {
        const response = await axiosClient.get<Team[]>('/champions/team');
        return response.data;
    },

    /**
     * Tạo đội bóng mới
     */
    createTeam: async (data: CreateTeamRequest, logoFile?: File): Promise<void> => {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('team', jsonBlob);
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        await axiosClient.post('/champions/team/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Cập nhật đội bóng
     */
    updateTeam: async (teamId: number, data: UpdateTeamRequest, logoFile?: File): Promise<void> => {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('team', jsonBlob);
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        await axiosClient.put(`/champions/team/update/${teamId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Xóa đội bóng
     */
    deleteTeam: async (teamId: number): Promise<void> => {
        await axiosClient.delete(`/champions/team/delete/${teamId}`);
    },

    /**
     * Tạo tài khoản HLV cho đội
     */
    createCoach: async (data: CreateCoachRequest): Promise<void> => {
        await axiosClient.post('/champions/admin/create-coach', data);
    },
};
