import { useState } from "react";
import type { ReactNode } from "react";
import { getInitialUser, type User } from "../utils/auth.utils";
import { AuthContext } from "./AuthContext";

export interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Lấy trạng thái ban đầu từ LocalStorage (thông qua hàm getInitialUser)
    const [user, setUser] = useState<User | null>(getInitialUser);

    const login = (token: string, userData: User) => {
        // 1. Lưu các thông tin cơ bản vào LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("username", userData.username);

        // 2. 👇 QUAN TRỌNG: Lưu teamId nếu có (Dành cho Coach)
        if (userData.teamId) {
            localStorage.setItem("teamId", String(userData.teamId));
        } else {
            // Nếu là Admin (không có team), xóa teamId cũ đi cho sạch
            localStorage.removeItem("teamId");
        }

        // 3. Cập nhật State để React render lại giao diện ngay lập tức
        setUser(userData);
    };

    const logout = () => {
        // Xóa sạch mọi thứ khi đăng xuất
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
