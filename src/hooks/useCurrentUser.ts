import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
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

        if (error) throw error;
        
        setUser(profile as UserProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { 
    user, 
    loading, 
    isAdmin: user?.role === 'admin',
    role: user?.role,
    school_id: user?.school_id,
    full_name: user?.full_name,
    id: user?.id
  };
}
