
import { Package, Search, Settings, Home, History, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAccountSidebarCard } from "./UserAccountSidebarCard";

export function AppSidebar() {
  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Product Scraper",
      url: "/scraper",
      icon: Search,
    },
    {
      title: "History",
      url: "/history", 
      icon: History,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const helpItems = [
    {
      title: "Help & Support",
      url: "/help",
      icon: HelpCircle,
    },
  ];

  return (
    <Sidebar className="border-r border-[#2A2A2A] bg-[#1A1A1A]">
      <SidebarHeader className="border-b border-[#2A2A2A] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF7A00]">
            <Package className="h-4 w-4 text-[#FFFFFF]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#FFFFFF] font-inter">Amazon Scraper</h2>
            <p className="text-sm text-[#E0E0E0]/80">Product Data Extraction</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#FFFFFF]/60 text-xs font-medium uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg font-inter">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-[#FFFFFF]/60 text-xs font-medium uppercase tracking-wider mb-2">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg font-inter">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#2A2A2A] p-4">
        <UserAccountSidebarCard />
      </SidebarFooter>
    </Sidebar>
  );
}
