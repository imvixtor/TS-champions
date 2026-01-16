// Routes configuration
export const ROUTES = {
    // Public routes
    HOME: '/',
    STANDINGS: '/standings',
    LOGIN: '/login',
    
    // Admin routes
    ADMIN: {
        BASE: '/admin',
        MATCHES: '/admin/matches',
        SCHEDULE: '/admin/schedule',
        MATCH_CONSOLE: (id: number) => `/admin/match/${id}/console`,
        TOURNAMENTS: '/admin/tournaments',
        TEAMS: '/admin/teams',
        PLAYERS: '/admin/players',
    },
    
    // Coach routes
    COACH: {
        BASE: '/coach',
        MATCHES: '/coach/matches',
        LINEUP: (id: number) => `/coach/match/${id}/lineup`,
        SQUAD: '/coach/squad',
    },
} as const;
