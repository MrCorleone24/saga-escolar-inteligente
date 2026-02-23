import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/aulas" element={<MinhasAulas />} />
          <Route path="/conquistas" element={<Conquistas />} />
          <Route path="/esportes" element={<Esportes />} />
          <Route path="/professor" element={<TeacherDashboard />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/planejamento" element={<Planejamento />} />
          <Route path="/ia-pedagogica" element={<IAPedagogica />} />
          <Route path="/lousa" element={<Lousa />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/escolas" element={<Escolas />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
