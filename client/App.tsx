import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import Mapa from "@/pages/Mapa";
import Agendar from "@/pages/Agendar";
import PontosDeColeta from "@/pages/PontosDeColeta";
import CriarPonto from "@/pages/CriarPonto";
import Agendamentos from "@/pages/Agendamentos";
import Guia from "@/pages/Guia";
import Conta from "@/pages/Conta";
import Login from "@/pages/Login";
import { AuthProvider } from "@/hooks/useAuth";
import AuthCallback from "@/pages/AuthCallback";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

//Estrutura do site:
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/mapa" element={<Mapa />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/agendar" element={<Agendar />} />
                  <Route path="/pontos" element={<PontosDeColeta />} />
                  <Route path="/pontos/novo" element={<CriarPonto />} />
                  <Route path="/agendamentos" element={<Agendamentos />} />
                  <Route path="/conta" element={<Conta />} />
                </Route>
                <Route path="/guia" element={<Guia />} />
                <Route path="/conta/entrar" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Rota de NotFound. Todas as rotas normais ficam acima dele. */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
