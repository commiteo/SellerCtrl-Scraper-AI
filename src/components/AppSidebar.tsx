
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

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-[#404040] bg-[#171717]">
      <SidebarHeader className="border-b border-[#404040] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EB5F01]">
            <Package className="h-4 w-4 text-[#FAFAFA]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#FAFAFA]">Amazon Scraper</h2>
            <p className="text-sm text-[#A3A3A3]">Product Data Extraction</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#A3A3A3] text-xs font-medium uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-colors duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
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
          <SidebarGroupLabel className="text-[#A3A3A3] text-xs font-medium uppercase tracking-wider mb-2">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-colors duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
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
      
      <SidebarFooter className="border-t border-[#404040] p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#EB5F01] to-[#F97316] flex items-center justify-center">
            <span className="text-[#FAFAFA] text-sm font-medium">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#FAFAFA]">User Account</p>
            <p className="text-xs text-[#A3A3A3]">Free Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
