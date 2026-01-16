import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = () => {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="font-semibold">Quản trị viên</div>
                </header>
                <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto bg-muted/20">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};
