
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle"; // We'll add this later

type DashboardHeaderProps = {
  userType: "client" | "freelancer";
  userName: string;
};

export function DashboardHeader({ userType }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            <span className="font-bold">PromisePay  </span>
          </div>
          <span>Dashboard</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {userType === "client" ? "CLIENT" : "FREELANCER"}
          </span>
        </div>
        <nav className="ml-auto flex items-center gap-4 lg:gap-6">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
