
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle"; // We'll add this later

type DashboardHeaderProps = {
  userType: "client" | "freelancer";
  userName: string;
};

export function DashboardHeader({ userType }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background sticky top-0 z-10 px-8">
      <div className="flex h-16 items-center">
        <div className="flex items-center gap-4 font-semibold">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            <span className="font-bold">PromisePay  </span>
          </div>
          <span>Dashboard</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {userType === "client" ? "CLIENT" : "FREELANCER"}
          </span>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
