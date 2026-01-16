import type { User } from '../types';

export type { User };

export const getInitialUser = (): User | null => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const teamId = localStorage.getItem("teamId");


    if (!token || !username || !role) {
        return null;
    }

    return {
        username,
        role,
        teamId: teamId ? Number(teamId) : undefined,
    };
};
