// Player related types
export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
    id: number;
    name: string;
    shirtNumber: number;
    position: string;
    avatar: string | null;
    teamId: number;
    nationality?: string;
}

export interface CreatePlayerRequest {
    name: string;
    shirtNumber: number;
    position: string;
    teamId: number;
}
