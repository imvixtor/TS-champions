import axiosClient from './api/client';
import type { Player, CreatePlayerRequest } from '../types';

export type { Player, CreatePlayerRequest };

export const playerService = {
    /**
     * Lấy danh sách cầu thủ theo đội
     */
    getPlayersByTeam: async (teamId: number): Promise<Player[]> => {
        const response = await axiosClient.get<Player[]>(`/champions/player/by-team/${teamId}`);
        return response.data;
    },

    /**
     * Tạo cầu thủ mới
     */
    createPlayer: async (data: CreatePlayerRequest, avatarFile?: File): Promise<void> => {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('player', jsonBlob);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        await axiosClient.post('/champions/player/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Xóa cầu thủ
     */
    deletePlayer: async (playerId: number): Promise<void> => {
        await axiosClient.delete(`/champions/player/delete/${playerId}`);
    },
};
