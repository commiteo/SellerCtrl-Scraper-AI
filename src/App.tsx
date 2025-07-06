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
import { UserProvider } from "./components/UserContext";
import NoonScraperPage from "./pages/NoonScraper";
import Crawl4AIPage from "./pages/Crawl4AI";
import Competitors from "./pages/Competitors";
import MySellerAccounts from "./pages/MySellerAccounts";
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
        <header className="border-b border-[#2A2A2A] bg-[#1A1A1A]/60 backdrop-blur-md">
          <div className="flex items-center gap-4 px-6 py-4">
            <SidebarTrigger className="text-[#E0E0E0] hover:bg-[#1F1F1F]" />
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#FFD600]">
                <Package className="h-5 w-5 text-[#FFFFFF]" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-[#FFFFFF] font-inter tracking-tight">{title}</h1>
                <p className="text-sm text-[#E0E0E0]/80 font-inter">{subtitle}</p>
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
            <Route path="/history" element={<History />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/account" element={<Account />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/my-seller-accounts" element={<MySellerAccounts />} />
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
        <UserProvider>
          <SidebarProvider>
            <AppLayout />
          </SidebarProvider>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
