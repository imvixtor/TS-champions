import { useState } from "react";
import type { ReactNode } from "react";
import { getInitialUser, type User } from "./auth.utils";
import { AuthContext } from "./AuthContext";

export interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(getInitialUser);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("username", userData.username);
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
