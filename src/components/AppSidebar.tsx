import { NavLink } from "react-router-dom";
import { ChevronDown, Package, Search, Settings, Home, History, HelpCircle, Users, Monitor, BarChart } from "lucide-react";
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UserAccountSidebarCard } from "./UserAccountSidebarCard";
import { useState } from "react";

export function AppSidebar() {
  const [scraperOpen, setScraperOpen] = useState(
    window.location.pathname.startsWith("/scraper") ||
    window.location.pathname.startsWith("/noon-scraper") ||
    window.location.pathname.startsWith("/crawl") ||
    window.location.pathname.startsWith("/multi-domain")
  );

  const [competitorsOpen, setCompetitorsOpen] = useState(
    window.location.pathname.startsWith("/competitors") || window.location.pathname.startsWith("/my-seller-accounts")
  );

  const [settingsOpen, setSettingsOpen] = useState(
    window.location.pathname.startsWith("/settings") || window.location.pathname.startsWith("/telegram-settings")
  );

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    // Product Scraper and Noon Scraper will be handled as dropdown below
    {
      title: "History",
      url: "/history",
      icon: History,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart,
    },
    {
      title: "Competitors",
      url: "/competitors",
      icon: Users,
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

  // Helper to determine if a route is active
  const isActiveRoute = (path: string) => {
    return window.location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-[#2A2A2A] bg-[#1A1A1A] w-full sm:w-64 lg:w-72">
      <SidebarHeader className="border-b border-[#2A2A2A] p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#FF7A00]">
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFFFFF]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-lg font-semibold text-[#FFFFFF] font-inter">SellerCtrl</h2>
            <p className="text-xs sm:text-sm text-[#E0E0E0]/80">Monitor your products & competitors</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 sm:px-4 py-4 sm:py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#FFFFFF]/60 text-xs font-medium uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home */}
              <SidebarMenuItem key="Home">
                <SidebarMenuButton asChild isActive={isActiveRoute("/")} className="text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200">
                  <NavLink to="/" className={({ isActive }) => `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-sm sm:text-base ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`} end>
                    <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Home</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Product Scraper Collapsible */}
              <SidebarMenuItem key="Product Scraper">
                <button
                  type="button"
                  className={`flex items-center w-full gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200 text-sm sm:text-base ${scraperOpen ? 'bg-[#232323]' : ''}`}
                  onClick={() => setScraperOpen((open) => !open)}
                  aria-expanded={scraperOpen}
                >
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Product Scraper</span>
                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-auto transition-transform ${scraperOpen ? 'rotate-180' : ''}`} />
                </button>
                {scraperOpen && (
                  <SidebarMenu>
                    <SidebarMenuItem key="Amazon">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/scraper")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/scraper" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>Amazon</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Noon">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/noon-scraper")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/noon-scraper" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>Noon</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Crawl">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/crawl")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/crawl" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>Any Link</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Multi-Domain">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/multi-domain")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/multi-domain" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>🌍 Multi-Domain</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarMenuItem>
              {/* Price Monitor */}
              <SidebarMenuItem key="Price Monitor">
                <SidebarMenuButton asChild isActive={isActiveRoute("/price-monitor")} className="text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200">
                  <NavLink to="/price-monitor" className={({ isActive }) => `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-sm sm:text-base ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`} end>
                    <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Price Monitor</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* History */}
              <SidebarMenuItem key="History">
                <SidebarMenuButton asChild isActive={isActiveRoute("/history")} className="text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200">
                  <NavLink to="/history" className={({ isActive }) => `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-sm sm:text-base ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`} end>
                    <History className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>History</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Competitors Dropdown */}
              <SidebarMenuItem key="Competitors">
                <button
                  type="button"
                  className={`flex items-center w-full gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200 text-sm sm:text-base ${competitorsOpen ? 'bg-[#232323]' : ''}`}
                  onClick={() => setCompetitorsOpen((open) => !open)}
                  aria-expanded={competitorsOpen}
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Competitors</span>
                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-auto transition-transform ${competitorsOpen ? 'rotate-180' : ''}`} />
                </button>
                {competitorsOpen && (
                  <SidebarMenu>
                    <SidebarMenuItem key="My Seller Accounts">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/my-seller-accounts")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/my-seller-accounts" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>My Seller Accounts</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="My Competitors">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/competitors")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/competitors" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>My Competitors</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarMenuItem>
              {/* Settings */}
              <SidebarMenuItem key="Settings">
                <button
                  type="button"
                  className={`flex items-center w-full gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200 text-sm sm:text-base ${settingsOpen ? 'bg-[#232323]' : ''}`}
                  onClick={() => setSettingsOpen((open) => !open)}
                  aria-expanded={settingsOpen}
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Settings</span>
                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                </button>
                {settingsOpen && (
                  <SidebarMenu>
                    <SidebarMenuItem key="General Settings">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/settings")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>General Settings</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Telegram Settings">
                      <SidebarMenuButton asChild isActive={isActiveRoute("/telegram-settings")} className="ml-4 sm:ml-8 text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#232323] transition-colors duration-200">
                        <NavLink to="/telegram-settings" className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 rounded font-inter w-full text-xs sm:text-sm ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`}>📱 Telegram Notifications</NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-6 sm:mt-8">
          <SidebarGroupLabel className="text-[#FFFFFF]/60 text-xs font-medium uppercase tracking-wider mb-2">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveRoute(item.url)} className="text-[#E0E0E0] hover:text-[#FF7A00] hover:bg-[#1F1F1F] transition-colors duration-200">
                    <NavLink to={item.url} className={({ isActive }) => `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg font-inter text-sm sm:text-base ${isActive ? 'bg-[#232323] text-[#FF7A00]' : ''}`} end>
                      <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#2A2A2A] p-3 sm:p-4">
        <UserAccountSidebarCard />
      </SidebarFooter>
    </Sidebar>
  );
}
