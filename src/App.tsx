import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Home from "./pages/Home";
import Index from "./pages/Index";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";
import TelegramSettings from "./pages/TelegramSettings";
import { UserProvider } from "./components/UserContext";
import { SoundProvider } from "./contexts/SoundContext";
import { PriceMonitorProvider } from "./contexts/PriceMonitorContext";
import { AdvancedStateProvider } from "./contexts/AdvancedStateContext";
import NoonScraperPage from "./pages/NoonScraper";

import Competitors from "./pages/Competitors";
import MySellerAccounts from "./pages/MySellerAccounts";
import MultiDomainScraperPage from "./pages/MultiDomainScraper";
import PriceMonitor from "./pages/PriceMonitor";
import Analytics from "./pages/Analytics";
import { Package } from 'lucide-react';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  
  // Initialize keyboard shortcuts
  const { showHelp, setShowHelp } = useKeyboardShortcuts();
  const title = 'SellerCtrl Scraper';
  let subtitle = 'Monitor your products & competitors on Amazon & Noon';
  if (location.pathname.startsWith('/scraper')) {
    subtitle = 'Extract product data from Amazon';
  } else if (location.pathname.startsWith('/noon-scraper')) {
    subtitle = 'Extract product data from Noon';

  } else if (location.pathname.startsWith('/multi-domain')) {
    subtitle = 'Scrape products from multiple Amazon domains';
  } else if (location.pathname.startsWith('/price-monitor')) {
    subtitle = 'Monitor product prices automatically';
  } else if (location.pathname.startsWith('/history')) {
    subtitle = 'View and export your scraping history';
  } else if (location.pathname.startsWith('/settings')) {
    subtitle = 'Manage your preferences';
  } else if (location.pathname.startsWith('/help')) {
    subtitle = 'Get help and support';
  }
  return (
    <div className="min-h-screen flex w-full font-inter bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-background">
        <header className="border-b border-border bg-sidebar-background/60 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent p-1 sm:p-2 rounded-md transition-colors" />
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#FFD600]">
                  <Package className="h-3 w-3 sm:h-5 sm:w-5 text-[#FFFFFF]" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-xl font-bold text-sidebar-foreground font-inter tracking-tight truncate">{title}</h1>
                  <p className="text-xs sm:text-sm text-sidebar-foreground/80 font-inter truncate">{subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scraper" element={<Index />} />
            <Route path="/noon-scraper" element={<NoonScraperPage />} />

            <Route path="/multi-domain" element={<MultiDomainScraperPage />} />
            <Route path="/price-monitor" element={<PriceMonitor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/account" element={<Account />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/my-seller-accounts" element={<MySellerAccounts />} />
            <Route path="/telegram-settings" element={<TelegramSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="sellerctrl-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdvancedStateProvider>
            <UserProvider>
              <SoundProvider>
                <PriceMonitorProvider>
                  <SidebarProvider>
                    <AppLayout />
                  </SidebarProvider>
                </PriceMonitorProvider>
              </SoundProvider>
            </UserProvider>
          </AdvancedStateProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
