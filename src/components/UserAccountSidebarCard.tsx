
import { Menu, LogOut, User, CreditCard, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";

export function UserAccountSidebarCard() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Avatar className="h-10 w-10">
        {/* Just a sample photo, replace src with real user avatar if you have it */}
        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
        <AvatarFallback className="bg-gradient-to-r from-[#FF7A00] to-[#D46A00] text-white">
          s
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-[#FFFFFF]">shadcn</p>
        <p className="truncate text-xs text-[#E0E0E0]/80">m@example.com</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-2 rounded-full p-1 hover:bg-[#232323] transition"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-[#E0E0E0] hover:text-[#FF7A00] transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-48 bg-[#1A1A1A] border-[#2A2A2A]">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-semibold text-[#FFFFFF]">shadcn</span>
            <span className="text-xs text-[#A3A3A3]">m@example.com</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[#FF7A00] focus:text-[#FF7A00]">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
