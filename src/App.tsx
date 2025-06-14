
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
          <div className="min-h-screen flex w-full bg-[#0A0A0A] text-[#FAFAFA]">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <header className="border-b border-[#404040] bg-[#171717]/50 backdrop-blur-sm">
                <div className="flex items-center gap-4 px-6 py-4">
                  <SidebarTrigger className="text-[#FAFAFA] hover:bg-[#171717]" />
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-[#FAFAFA]">Amazon Product Scraper</h1>
                    <p className="text-sm text-[#A3A3A3]">Extract product data using ASIN</p>
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-auto">
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
