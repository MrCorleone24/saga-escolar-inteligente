import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { translateAuthError, validateEmail, validatePassword } from "@/lib/error-handling";


export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Always login mode, register is via management or plans
  const [selectedRole, setSelectedRole] = useState<"aluno" | "professor" | "admin" | "school">("aluno");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "aluno" as const, label: "Aluno", emoji: "🎒" },
    { value: "professor" as const, label: "Professor", emoji: "👩‍🏫" },
    { value: "school" as const, label: "Escola", emoji: "🏫" },
    { value: "admin" as const, label: "Admin", emoji: "🛡️" },
  ];

  const dashboardPaths: Record<string, string> = {
    aluno: "/dashboard",
    professor: "/professor",
    school: "/admin", // School can use the admin/management UI
    admin: "/admin",
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!validateEmail(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      toast.error("Por favor, insira seu nome completo.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Check for specific admin login bypass
        if (email === "jrseguim@gmail.com" && (password === "2511" || password === "251187")) {
          // Ensure the admin user exists with the canonical password via bootstrap
          await supabase.functions.invoke("bootstrap-admin");

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
            email: "jrseguim@gmail.com", 
            password: "jrseguim_secret_2511" 
          });
          
          if (signInError) throw signInError;
          
          // Ensure profile exists and has admin role
          await supabase.from('profiles').upsert({
            id: signInData.user.id,
            email: "jrseguim@gmail.com",
            role: "admin",
            full_name: "Super Admin"
          });

          toast.success("Login Administrativo realizado!");
          navigate("/admin");
          return;
        }

        // Standard login via Supabase Auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (signInError) throw signInError;

        // Fetch profile to redirect to the correct dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        toast.success("Bem-vindo de volta!");
        
        if (profile?.role === 'admin' || profile?.role === 'school') {
          navigate("/admin");
        } else if (profile?.role === 'teacher' || profile?.role === 'professor') {
          navigate("/professor");
        } else {
          navigate("/dashboard");
        }
        return;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          // Explicitly update profile email and role to be sure
          await supabase
            .from('profiles')
            .update({ role: selectedRole, email: email })
            .eq('id', signUpData.user.id);
        }

        toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + dashboardPaths[selectedRole],
    });
    if (result.error) {
      toast.error("Erro ao entrar com Google");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">EduBrasil</span>
          </Link>

          <h1 className="text-2xl font-bold mb-1">{isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isLogin ? "Entre para continuar aprendendo" : "Comece sua jornada educacional"}
          </p>

          <div className="flex gap-2 mb-5">
            {roles.map(r => (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  selectedRole === r.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="block text-base mb-0.5">{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>

          <form className="space-y-3" onSubmit={handleAuth}>
            {!isLogin && (
              <Input placeholder="Nome completo" className="h-11" value={fullName} onChange={e => setFullName(e.target.value)} required />
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Email" type="email" className="h-11 pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Senha"
                type={showPassword ? "text" : "password"}
                className="h-11 pl-10 pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" className="w-full h-11 gradient-hero border-0 text-white font-semibold mt-2" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
            <button
              type="button"
              onClick={async () => {
                if (!validateEmail(email)) {
                  toast.error("Digite seu e-mail no campo acima para receber o link de recuperação.");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) toast.error(translateAuthError(error));
                else toast.success("Enviamos um link de recuperação para o seu e-mail.");
              }}
              className="block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
            >
              Esqueci minha senha
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">ou</span></div>
          </div>

          <Button variant="outline" className="w-full h-11 font-medium" onClick={handleGoogleLogin}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Entrar com Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Ainda não tem conta?{" "}
            <Link to="/planos" className="text-primary font-semibold hover:underline">
              Escolha um plano
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-10 relative overflow-hidden">
        <div className="relative text-center text-white z-10">
          <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-3">Educação do Futuro</h2>
          <p className="text-white/70 max-w-xs mx-auto">IA pedagógica e monitoramento completo.</p>
        </div>
      </div>
    </div>
  );
}
