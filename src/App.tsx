import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MinhasAulas from "./pages/MinhasAulas";
import Conquistas from "./pages/Conquistas";
import Esportes from "./pages/Esportes";
import Turmas from "./pages/Turmas";
import Planejamento from "./pages/Planejamento";
import IAPedagogica from "./pages/IAPedagogica";
import Lousa from "./pages/Lousa";
import Relatorios from "./pages/Relatorios";
import Escolas from "./pages/Escolas";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import CriarAula from "./pages/CriarAula";
import AulaView from "./pages/AulaView";
import MeuCaderno from "./pages/MeuCaderno";
import CalendarioEscolar from "./pages/CalendarioEscolar";
import Leitura from "./pages/Leitura";
import CadernoAlunos from "./pages/CadernoAlunos";
import GerenciarLeitura from "./pages/GerenciarLeitura";
import VideoSalas from "./pages/VideoSalas";
import Planos from "./pages/Planos";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<AuthWrapper><StudentDashboard /></AuthWrapper>} />
          <Route path="/aulas" element={<AuthWrapper><MinhasAulas /></AuthWrapper>} />
          <Route path="/conquistas" element={<AuthWrapper><Conquistas /></AuthWrapper>} />
          <Route path="/esportes" element={<AuthWrapper><Esportes /></AuthWrapper>} />
          <Route path="/meu-caderno" element={<AuthWrapper><MeuCaderno /></AuthWrapper>} />
          <Route path="/calendario" element={<AuthWrapper><CalendarioEscolar /></AuthWrapper>} />
          <Route path="/leitura" element={<AuthWrapper><Leitura /></AuthWrapper>} />
          <Route path="/aula/:id" element={<AuthWrapper><AulaView /></AuthWrapper>} />
          <Route path="/salas" element={<AuthWrapper><VideoSalas /></AuthWrapper>} />
          <Route path="/professor" element={<AuthWrapper><TeacherDashboard /></AuthWrapper>} />
          <Route path="/turmas" element={<AuthWrapper><Turmas /></AuthWrapper>} />
          <Route path="/planejamento" element={<AuthWrapper><Planejamento /></AuthWrapper>} />
          <Route path="/criar-aula" element={<AuthWrapper><CriarAula /></AuthWrapper>} />
          <Route path="/caderno-alunos" element={<AuthWrapper><CadernoAlunos /></AuthWrapper>} />
          <Route path="/gerenciar-leitura" element={<AuthWrapper><GerenciarLeitura /></AuthWrapper>} />
          <Route path="/ia-pedagogica" element={<AuthWrapper><IAPedagogica /></AuthWrapper>} />
          <Route path="/lousa" element={<AuthWrapper><Lousa /></AuthWrapper>} />
          <Route path="/relatorios" element={<AuthWrapper><Relatorios /></AuthWrapper>} />
          <Route path="/admin" element={<AuthWrapper><AdminDashboard /></AuthWrapper>} />
          <Route path="/escolas" element={<AuthWrapper><Escolas /></AuthWrapper>} />
          <Route path="/usuarios" element={<AuthWrapper><Usuarios /></AuthWrapper>} />
          <Route path="/planos" element={<AuthWrapper><Planos /></AuthWrapper>} />
          <Route path="/configuracoes" element={<AuthWrapper><Configuracoes /></AuthWrapper>} />
          <Route path="/financeiro" element={<AuthWrapper><Financeiro /></AuthWrapper>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
