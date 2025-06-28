"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "../../../../components/AppSidebar"
import { usePathname } from "next/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const role = pathname.includes("/client") ? "client" : "freelancer"

    return (
        <SidebarProvider>
            <AppSidebar role={role} />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}
