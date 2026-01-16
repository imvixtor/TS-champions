import {
    Calendar,
    LogOut,
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

export function CoachSidebar() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const items = [
        {
            title: "Lịch Thi Đấu",
            url: "/coach/matches",
            icon: Calendar,
        },
        {
            title: "Đội Hình",
            url: "/coach/squad",
            icon: Users,
        },
    ]

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border p-4">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-bold text-primary">COACH ZONE</span>
                    <span className="text-xs text-muted-foreground">HLV. {user?.username}</span>
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
