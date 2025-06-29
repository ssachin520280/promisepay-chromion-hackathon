"use client"

import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarRail } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const role = pathname.includes("/client") ? "client" : "freelancer"

    return (
        <SidebarProvider>
            <AppSidebar role={role} />
            <main className="flex flex-col flex-1 ml-0 min-w-0 w-full">
                <SidebarRail />
                <div className="flex-1 w-full">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
