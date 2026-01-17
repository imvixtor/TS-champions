import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button } from "@/components/ui/button"
import { Circle } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-background border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg transform group-hover:rotate-12 transition duration-300">
                        ⚽
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        FOOTBALL MANAGER
                    </span>
                </Link>

                {/* MENU */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link to="/">
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Lịch Thi Đấu
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link to="/standings">
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Bảng Xếp Hạng
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* USER / LOGIN */}
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                                Hi, {user.username}
                            </span>
                            <Button variant="destructive" size="sm" onClick={logout}>
                                Thoát
                            </Button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button>Đăng Nhập</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
