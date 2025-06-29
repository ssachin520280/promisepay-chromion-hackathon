"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Wallet } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function ConnectWalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state } = useSidebar();

  async function connectWallet() {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) {
      setError((err as Error).message || "Failed to connect wallet");
    }
  }

  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
  };

  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {account ? (
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            onClick={disconnectWallet}
            tooltip="Disconnect Wallet"
          >
            <Wallet className="h-4 w-4" />
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Connected</span>
                <span className="truncate text-xs text-muted-foreground">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            )}
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton
            size="lg"
            className={cn(
              "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
              "border-2 border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            )}
            onClick={connectWallet}
            tooltip="Connect Wallet"
          >
            <Wallet className="h-4 w-4" />
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Connect Wallet</span>
                <span className="truncate text-xs text-muted-foreground">
                  {error ? "Connection failed" : "Click to connect"}
                </span>
              </div>
            )}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}