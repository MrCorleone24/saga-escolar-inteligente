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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewRole, setViewRole] = useState<UserRole | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      console.log("[Auth] Buscando perfil do usuário...");
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("[Auth] Erro ao obter usuário auth:", authError);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!authUser) {
        console.log("[Auth] Nenhum usuário autenticado encontrado.");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("[Auth] Usuário autenticado ID:", authUser.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn("[Auth] Perfil não encontrado no banco de dados para ID:", authUser.id);
          // Try to create profile if missing (resilience)
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || 'Usuário',
              role: authUser.user_metadata?.role || 'aluno'
            })
            .select()
            .single();
          
          if (createError) {
            console.error("[Auth] Falha ao criar perfil resiliente:", createError);
          } else if (newProfile) {
            console.log("[Auth] Perfil criado automaticamente via hook.");
            setUser(newProfile as UserProfile);
            setLoading(false);
            return;
          }
        } else {
          console.error("[Auth] Erro ao buscar perfil:", error);
        }
      }

      if (profile) {
        console.log("[Auth] Perfil carregado:", profile.role);
        setUser(profile as UserProfile);
        
        // Initialize view role
        if (profile.role === 'admin') {
          const saved = localStorage.getItem('admin_view_role') as UserRole;
          setViewRole(saved || 'admin');
        } else {
          let role = profile.role as UserRole;
          // Normalize legacy roles
          if (role === 'teacher' || role === 'professor') {
            role = profile.school_id ? 'teacher_institutional' : 'teacher_solo';
          } else if (role === 'student') {
            role = 'aluno';
          }
          setViewRole(role);
        }
      }
    } catch (error) {
      console.error("[Auth] Erro inesperado no fetchProfile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] Evento AuthStateChange: ${event}`);
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
      console.log(`[Auth] Admin trocando visão para: ${newRole}`);
      setViewRole(newRole);
      localStorage.setItem('admin_view_role', newRole);
    }
  };

  const effectiveRole = (viewRole || (user?.role as UserRole)) as UserRole;

  // Normalized version for routing consistency
  const normalizedForPages = (() => {
    if (!effectiveRole) return effectiveRole;
    if (['teacher_solo', 'teacher_institutional', 'professor', 'teacher'].includes(effectiveRole)) return 'teacher';
    if (['aluno', 'student'].includes(effectiveRole)) return 'student';
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
    role: effectiveRole, // The raw role used in AuthWrapper
    school_id: user?.school_id,
    full_name: user?.full_name,
    id: user?.id,
    switchViewRole
  };
}
