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
import ResetPassword from "./pages/ResetPassword";
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
          <Route path="/reset-password" element={<ResetPassword />} />
          
          
          {/* Protected Routes */}
          {/* Student Area */}
          <Route path="/dashboard" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><StudentDashboard /></AuthWrapper>} />
          <Route path="/aulas" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><MinhasAulas /></AuthWrapper>} />
          <Route path="/conquistas" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><Conquistas /></AuthWrapper>} />
          <Route path="/esportes" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><Esportes /></AuthWrapper>} />
          <Route path="/meu-caderno" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><MeuCaderno /></AuthWrapper>} />
          <Route path="/calendario" element={<AuthWrapper allowedRoles={["aluno", "teacher_solo", "teacher_institutional", "admin", "school"]}><CalendarioEscolar /></AuthWrapper>} />
          <Route path="/leitura" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><Leitura /></AuthWrapper>} />
          <Route path="/aula/:id" element={<AuthWrapper allowedRoles={["aluno", "admin"]}><AulaView /></AuthWrapper>} />
          <Route path="/salas" element={<AuthWrapper allowedRoles={["aluno", "teacher_solo", "teacher_institutional", "admin", "school"]}><VideoSalas /></AuthWrapper>} />

          {/* Teacher Area */}
          <Route path="/professor" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin"]}><TeacherDashboard /></AuthWrapper>} />
          <Route path="/turmas" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "school", "admin"]}><Turmas /></AuthWrapper>} />
          <Route path="/planejamento" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><Planejamento /></AuthWrapper>} />
          <Route path="/criar-aula" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><CriarAula /></AuthWrapper>} />
          <Route path="/caderno-alunos" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><CadernoAlunos /></AuthWrapper>} />
          <Route path="/gerenciar-leitura" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><GerenciarLeitura /></AuthWrapper>} />
          <Route path="/ia-pedagogica" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><IAPedagogica /></AuthWrapper>} />
          <Route path="/lousa" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><Lousa /></AuthWrapper>} />
          <Route path="/relatorios" element={<AuthWrapper allowedRoles={["teacher_solo", "teacher_institutional", "admin", "school"]}><Relatorios /></AuthWrapper>} />

          {/* Admin / School Area */}
          <Route path="/admin" element={<AuthWrapper allowedRoles={["admin", "school"]}><AdminDashboard /></AuthWrapper>} />
          <Route path="/escolas" element={<AuthWrapper allowedRoles={["admin", "school"]}><Escolas /></AuthWrapper>} />
          <Route path="/usuarios" element={<AuthWrapper allowedRoles={["admin", "school"]}><Usuarios /></AuthWrapper>} />
          <Route path="/planos" element={<AuthWrapper allowedRoles={["admin", "school"]}><Planos /></AuthWrapper>} />
          <Route path="/configuracoes" element={<AuthWrapper allowedRoles={["admin", "school", "teacher_solo", "teacher_institutional"]}><Configuracoes /></AuthWrapper>} />
          <Route path="/financeiro" element={<AuthWrapper allowedRoles={["admin", "school", "teacher_solo", "teacher_institutional"]}><Financeiro /></AuthWrapper>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
