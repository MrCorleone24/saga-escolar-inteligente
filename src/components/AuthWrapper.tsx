import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentUser, UserRole } from "@/hooks/useCurrentUser";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthWrapperProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthWrapper = ({ children, allowedRoles }: AuthWrapperProps) => {
  const { user, loading, role: currentRole, isAdmin } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      console.log(`[AuthGuard] Verificando rota: ${location.pathname}. User: ${!!user}, Role: ${currentRole}`);
      
      if (!user) {
        console.warn("[AuthGuard] Usuário não autenticado. Redirecionando para /login.");
        navigate("/login", { state: { from: location.pathname }, replace: true });
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        // Normalize roles for comparison
        const normalizedCurrentRole = currentRole as UserRole;
        
        // Admins can access if 'admin' is allowed, OR if they have switched to a role that is allowed
        const hasAccess = allowedRoles.includes(normalizedCurrentRole) || (isAdmin && allowedRoles.includes('admin'));
        
        if (!hasAccess) {
          console.error(`[AuthGuard] ACESSO NEGADO. Role atual: ${normalizedCurrentRole}. Requeridos:`, allowedRoles);
          toast.error("Você não tem permissão para acessar esta página.");
          
          // Avoid infinite redirect loop
          let target = "/";
          if (['aluno', 'student'].includes(normalizedCurrentRole)) target = "/dashboard";
          else if (['teacher', 'professor', 'teacher_solo', 'teacher_institutional'].includes(normalizedCurrentRole)) target = "/professor";
          else if (['admin', 'school'].includes(normalizedCurrentRole)) target = "/admin";

          // If the target is the current location, go to landing to break the loop
          if (target === location.pathname) {
            console.log("[AuthGuard] Loop detectado. Redirecionando para landing.");
            target = "/";
          }

          console.log("[AuthGuard] Redirecionando para dashboard seguro:", target);
          navigate(target, { replace: true });
        } else {
          console.log("[AuthGuard] ACESSO AUTORIZADO.");
        }
      }
    }
  }, [user, loading, currentRole, isAdmin, allowedRoles, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  // Final check before rendering
  if (!user) return null;
  
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(currentRole as UserRole) || (isAdmin && allowedRoles.includes('admin'));
    if (!hasAccess) return null;
  }

  return <>{children}</>;
};
