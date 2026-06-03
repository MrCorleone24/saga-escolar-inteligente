import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentUser, UserRole } from "@/hooks/useCurrentUser";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthWrapper = ({ children, allowedRoles }: AuthWrapperProps) => {
  const { user, loading, role: currentRole } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log(`[AuthGuard] Verificando rota: ${location.pathname}. Loading: ${loading}, User: ${!!user}, Role: ${currentRole}`);
    
    if (!loading) {
      if (!user) {
        console.warn("[AuthGuard] Usuário não autenticado. Redirecionando para /login.");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      // If specific roles are required, check if user has them
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(currentRole as UserRole)) {
          console.warn(`[AuthGuard] Acesso negado para role ${currentRole} na rota ${location.pathname}. Permissões:`, allowedRoles);
          
          let target = "/";
          if (currentRole === 'aluno' || currentRole === 'student') target = "/dashboard";
          else if (['teacher', 'professor', 'teacher_solo', 'teacher_institutional'].includes(currentRole as string)) target = "/professor";
          else if (['admin', 'school'].includes(currentRole as string)) target = "/admin";

          console.log("[AuthGuard] Redirecionando para dashboard padrão da role:", target);
          navigate(target);
        } else {
          console.log("[AuthGuard] Acesso autorizado.");
        }
      }
    }
  }, [user, loading, currentRole, navigate, allowedRoles, location.pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Final check before rendering
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(currentRole as UserRole)) return null;

  return <>{children}</>;
};
