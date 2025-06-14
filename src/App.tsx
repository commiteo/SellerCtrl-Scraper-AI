
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Home from "./pages/Home";
import Index from "./pages/Index";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full font-inter bg-[#0D0D0D] text-[#E0E0E0]">
            <AppSidebar />
            <main className="flex-1 flex flex-col min-h-screen bg-[#0D0D0D]">
              <header className="border-b border-[#2A2A2A] bg-[#1A1A1A]/60 backdrop-blur-md">
                <div className="flex items-center gap-4 px-6 py-4">
                  <SidebarTrigger className="text-[#E0E0E0] hover:bg-[#1F1F1F]" />
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-[#FFFFFF] font-inter">Amazon Product Scraper</h1>
                    <p className="text-sm text-[#E0E0E0]/80">Extract product data using ASIN</p>
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-auto bg-[#0D0D0D]">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/scraper" element={<Index />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
