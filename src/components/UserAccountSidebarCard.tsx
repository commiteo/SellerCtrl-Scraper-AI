
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
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export function UserAccountSidebarCard() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Avatar className="h-10 w-10 border-2 border-[#FF7A00] shadow-sm">
        <AvatarImage
          src={user.avatar || ""}
          alt={user.name}
        />
        <AvatarFallback className="bg-gradient-to-r from-[#FF7A00] to-[#D46A00] text-white text-lg">
          {user.name.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-[#FFFFFF]">{user.name}</p>
        <p className="truncate text-xs text-[#E0E0E0]/80">{user.email}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-2 rounded-full p-1 hover:bg-[#232323] transition focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-[#E0E0E0] hover:text-[#FF7A00] transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          className="w-52 bg-[#161616] border-[#232323] shadow-lg"
        >
          <DropdownMenuLabel className="flex flex-col !px-4 !py-3">
            <span className="font-semibold text-white">{user.name}</span>
            <span className="text-xs text-[#A3A3A3]">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => navigate("/account")}
          >
            <User className="mr-2 h-4 w-4 text-[#E0E0E0] group-hover:text-[#FF7A00]" />
            <span className="font-medium text-[#E0E0E0]">Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => navigate("/billing")}
          >
            <CreditCard className="mr-2 h-4 w-4 text-[#E0E0E0] group-hover:text-[#FF7A00]" />
            <span className="font-medium text-[#E0E0E0]">Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => navigate("/notifications")}
          >
            <Bell className="mr-2 h-4 w-4 text-[#E0E0E0] group-hover:text-[#FF7A00]" />
            <span className="font-medium text-[#E0E0E0]">Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-[#FF7A00] focus:text-[#FF7A00] cursor-pointer"
            onSelect={() => {/* Implement logout logic here */}}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
