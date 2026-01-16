import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../services';
import { useAuth } from '../../hooks';
import type { DecodedToken } from '../../types';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from 'lucide-react'


export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Gọi API đăng nhập
            const res = await authService.login({ username, password });
            const token = res.jwtToken;

            if (!token) throw new Error("Không nhận được token từ server!");

            // 2. Giải mã Token để lấy thông tin (Role, TeamID)
            const decoded: DecodedToken = jwtDecode(token);

            console.log("Login Success - Decoded Token:", decoded);

            // 3. Lưu thông tin vào Context & LocalStorage
            // Backend trả về 'sub' là username, ta map sang field username của User
            login(token, {
                username: decoded.sub,
                role: decoded.role,
                teamId: decoded.teamId // 👈 Quan trọng: Truyền teamId vào AuthProvider
            });

            // 4. Điều hướng dựa theo quyền
            if (decoded.role === 'ADMIN') {
                navigate('/admin/matches');
            } else if (decoded.role === 'COACH') {
                navigate('/coach/matches');
            } else {
                navigate('/');
            }

        } catch (err: any) {
            console.error("Login Error:", err);

            // Xử lý thông báo lỗi chi tiết
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Lỗi 403: Tài khoản hoặc mật khẩu không đúng!');
                } else if (err.response.status === 401) {
                    setError('Sai tài khoản hoặc mật khẩu!');
                } else {
                    setError(err.response.data?.message || 'Có lỗi xảy ra từ server.');
                }
            } else {
                setError('Không thể kết nối đến server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Football Manager</CardTitle>
                    <CardDescription>
                        Đăng nhập để vào hệ thống quản lý
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 font-medium">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="username">Tài khoản</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-xs text-muted-foreground">
                        © 2024 Football Champions League
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};
