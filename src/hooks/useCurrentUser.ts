import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "aluno" | "professor" | "admin" | "school" | "teacher_solo" | "teacher_institutional" | "student" | "teacher";

export interface UserProfile {
  id: string;
  role: string;
  school_id: string | null;
  teacher_id: string | null;
  full_name: string | null;
  xp?: number;
  level?: number;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initial sync from session if available
    const sessionStr = localStorage.getItem('supabase.auth.token');
    return null; // Keep null to force fetch, but could optimize later
  });
  const [loading, setLoading] = useState(true);
  const [viewRole, setViewRole] = useState<UserRole | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn("[Auth] Perfil não encontrado para o usuário autenticado.");
        } else {
          throw error;
        }
      }

      if (profile) {
        setUser(profile as UserProfile);
        
        // Initialize view role
        if (profile.role === 'admin') {
          const saved = localStorage.getItem('admin_view_role') as UserRole;
          setViewRole(saved || 'admin');
        } else {
          let role = profile.role as UserRole;
          if (role === 'teacher' || role === 'professor') {
            role = profile.school_id ? 'teacher_institutional' : 'teacher_solo';
          } else if (role === 'student') {
            role = 'aluno';
          }
          setViewRole(role);
        }
      }
    } catch (error) {
      console.error("[Auth] Erro ao buscar perfil:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] Evento de autenticação: ${event}`);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setViewRole(null);
        localStorage.removeItem('admin_view_role');
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const switchViewRole = (newRole: UserRole) => {
    if (user?.role === 'admin') {
      setViewRole(newRole);
      localStorage.setItem('admin_view_role', newRole);
    }
  };

  const effectiveRole = (viewRole || (user?.role as UserRole)) as UserRole;

  const normalizedForPages = (() => {
    if (!effectiveRole) return effectiveRole;
    if (effectiveRole === 'teacher_solo' || effectiveRole === 'teacher_institutional' || effectiveRole === 'professor') return 'teacher';
    if (effectiveRole === 'aluno') return 'student';
    return effectiveRole;
  })();

  const effectiveUser = user
    ? { ...user, role: user.role === 'admin' ? normalizedForPages : user.role }
    : null;

  return {
    user: effectiveUser,
    loading,
    isAdmin: user?.role === 'admin',
    originalRole: user?.role,
    role: effectiveRole,
    school_id: user?.school_id,
    full_name: user?.full_name,
    id: user?.id,
    switchViewRole
  };
}
