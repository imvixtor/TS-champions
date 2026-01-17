import {
    Calendar,
    LogOut,
    Shirt,
    Target,
    Trophy,
    Users,
} from "lucide-react"
import { useAuth } from "@/hooks"
import { ModeToggle } from "@/components/mode-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation, Link } from "react-router-dom"

export function AdminSidebar() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const items = [
        {
            title: "Quản lý Giải đấu",
            url: "/admin/tournaments",
            icon: Trophy,
        },

        {
            title: "Lịch Thi Đấu",
            url: "/admin/schedule",
            icon: Calendar,
        },
        {
            title: "Quản lý Trận đấu",
            url: "/admin/matches",
            icon: Target, // Changed from SoccerBall (not in Lucide) to Target or similar
        },
        {
            title: "Quản lý Đội bóng",
            url: "/admin/teams",
            icon: Shirt,
        },
        {
            title: "Quản lý Cầu thủ",
            url: "/admin/players",
            icon: Users,
        },
    ]

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border p-4">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-bold text-primary">ADMIN PANEL</span>
                    <span className="text-xs text-muted-foreground">Xin chào, {user?.username}</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url)}>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-center pb-2">
                        <ModeToggle />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => {
                                logout()
                                navigate("/login")
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <LogOut />
                            <span>Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
