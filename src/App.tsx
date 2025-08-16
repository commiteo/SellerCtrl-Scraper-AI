import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
import Crawl4AIPage from "./pages/Crawl4AI";
import Competitors from "./pages/Competitors";
import MySellerAccounts from "./pages/MySellerAccounts";
import MultiDomainScraperPage from "./pages/MultiDomainScraper";
import PriceMonitor from "./pages/PriceMonitor";
import Analytics from "./pages/Analytics";
import { Package } from 'lucide-react';

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const title = 'SellerCtrl Scraper';
  let subtitle = 'Monitor your products & competitors on Amazon & Noon';
  if (location.pathname.startsWith('/scraper')) {
    subtitle = 'Extract product data from Amazon';
  } else if (location.pathname.startsWith('/noon-scraper')) {
    subtitle = 'Extract product data from Noon';
  } else if (location.pathname.startsWith('/crawl')) {
    subtitle = 'Crawl any link and convert to Markdown';
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
    <div className="min-h-screen flex w-full font-inter bg-[#0D0D0D] text-[#E0E0E0]">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-[#0D0D0D]">
        <header className="border-b border-[#2A2A2A] bg-[#1A1A1A]/60 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4">
            <SidebarTrigger className="text-[#E0E0E0] hover:bg-[#1F1F1F] p-1 sm:p-2 rounded-md transition-colors" />
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#FFD600]">
                <Package className="h-3 w-3 sm:h-5 sm:w-5 text-[#FFFFFF]" />
              </span>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-[#FFFFFF] font-inter tracking-tight truncate">{title}</h1>
                <p className="text-xs sm:text-sm text-[#E0E0E0]/80 font-inter truncate">{subtitle}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-[#0D0D0D]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scraper" element={<Index />} />
            <Route path="/noon-scraper" element={<NoonScraperPage />} />
            <Route path="/crawl" element={<Crawl4AIPage />} />
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
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

export default App;
