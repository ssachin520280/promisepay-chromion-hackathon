import { FileCheck2, FilePlus2, Home, Settings, Star, Bell, MailCheckIcon, MessageSquare } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import ConnectWalletButton from "@/components/ConnectWalletButton";

interface AppSidebarProps {
    role: "client" | "freelancer";
}

// Define role-based menu items
const navItems = {
    client: [
        { title: "Dashboard", url: "/dashboard/client", icon: Home },
        { title: "New Contract", url: "/dashboard/client/new-contract", icon: FilePlus2 },
        { title: "My Contracts", url: "/dashboard/client/contracts", icon: MailCheckIcon },
        { title: "Messages", url: "/dashboard/client/messages", icon: MessageSquare },
        { title: "Ratings", url: "/dashboard/client/ratings", icon: Star },
        { title: "Settings", url: "/dashboard/client/settings", icon: Settings },
    ],
    freelancer: [
        { title: "Dashboard", url: "/dashboard/freelancer", icon: Home },
        { title: "My Contracts", url: "/dashboard/freelancer/contracts", icon: FileCheck2 },
        { title: "Messages", url: "/dashboard/freelancer/messages", icon: MessageSquare },
        { title: "Ratings", url: "/dashboard/freelancer/ratings", icon: Star },
        { title: "Settings", url: "/dashboard/freelancer/settings", icon: Settings },
    ],
};

export function AppSidebar({ role }: AppSidebarProps) {
    const items = navItems[role];

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-3xl my-5">PromisePay</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-2">
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <ConnectWalletButton />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
