"use client"

import { BellIcon, CreditCardIcon, LogOutIcon, MoreVerticalIcon, UserCircleIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

// Import the useFirebase hook and Firebase's signOut method
import { useFirebase } from "@/hooks/useFirebaseUser"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/client" // Firebase auth import
import { useRouter } from "next/navigation"

export function NavUser() {
    // Fetch user data from the Firebase hook
    const { user, loading, error } = useFirebase()
    const { isMobile } = useSidebar()  // This hook is always called, no conditional logic
    const router = useRouter()
    // Handle loading and error states
    if (loading) {
        return <div>Loading...</div>
    }

    if (error || !user) {
        return <div>Error fetching user data</div>
    }



    // Handle log out
    const handleLogOut = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            await signOut(auth);
            router.push("/sign-in")
            console.log("User logged out successfully")
        } catch (error) {
            console.error("Error logging out: ", error)
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.displayName}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <MoreVerticalIcon className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <UserCircleIcon />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCardIcon />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <BellIcon />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogOut}>
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
