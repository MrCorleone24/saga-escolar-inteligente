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
    if (!loading) {
      if (!user) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      // If specific roles are required, check if user has them
      if (allowedRoles && allowedRoles.length > 0) {
        // We use currentRole which already handles admin impersonation
        if (!allowedRoles.includes(currentRole as UserRole)) {
          // Redirect to their respective dashboard if they try to access unauthorized area
          console.warn(`Access denied for role ${currentRole} to ${location.pathname}`);
          
          if (currentRole === 'aluno' || currentRole === 'student') {
            navigate("/dashboard");
          } else if (['teacher', 'professor', 'teacher_solo', 'teacher_institutional'].includes(currentRole as string)) {
            navigate("/professor");
          } else if (['admin', 'school'].includes(currentRole as string)) {
            navigate("/admin");
          } else {
            navigate("/");
          }
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
