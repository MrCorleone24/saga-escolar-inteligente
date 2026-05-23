import { useState, useEffect } from "react";
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

  const fetchProfile = async () => {
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
          console.warn("Profile not found for authenticated user. This may happen if the profile creation failed.");
          // We could auto-create a profile here if needed, but for now just null
        } else {
          throw error;
        }
      }

      
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

    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setViewRole(null);
        localStorage.removeItem('admin_view_role');
      } else if (event === 'SIGNED_IN') {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchViewRole = (newRole: UserRole) => {
    if (user?.role === 'admin') {
      setViewRole(newRole);
      localStorage.setItem('admin_view_role', newRole);
    }
  };

  return { 
    user, 
    loading, 
    isAdmin: user?.role === 'admin',
    originalRole: user?.role,
    role: viewRole || (user?.role as UserRole),
    school_id: user?.school_id,
    full_name: user?.full_name,
    id: user?.id,
    switchViewRole
  };
}
