export interface User {
    username: string;
    role: string;
}

export const getInitialUser = (): User | null => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (token && role && username) {
        return { username, role };
    }
    return null;
};
