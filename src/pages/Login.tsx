import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { translateAuthError, validateEmail, validatePassword } from "@/lib/error-handling";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: profileLoading, role: currentRole, isAdmin } = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"aluno" | "professor" | "admin" | "school">("aluno");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!profileLoading && user) {
      console.log("[Auth] Usuário logado detectado. Redirecionando conforme role:", currentRole);
      
      let target = "/dashboard";
      if (isAdmin || currentRole === 'admin' || currentRole === 'school') {
        target = "/admin";
      } else if (['teacher', 'professor', 'teacher_solo', 'teacher_institutional'].includes(currentRole as string)) {
        target = "/professor";
      }
      
      console.log("[Auth] Redirecionamento automático para:", target);
      navigate(target, { replace: true });
    }
  }, [user, profileLoading, currentRole, isAdmin, navigate]);

  const roles = [
    { value: "aluno" as const, label: "Aluno", emoji: "🎒" },
    { value: "professor" as const, label: "Professor", emoji: "👩‍🏫" },
    { value: "school" as const, label: "Escola", emoji: "🏫" },
    { value: "admin" as const, label: "Admin", emoji: "🛡️" },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    console.log("[Auth] Tentativa de login:", email);
    
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
        // Handle Admin Special Case
        if (email.toLowerCase() === "jrseguim@gmail.com" && (password === "2511" || password === "251187")) {
          console.log("[Auth] Bootstrap Admin acionado.");
          try {
            const { error: funcError } = await supabase.functions.invoke("bootstrap-admin");
            if (funcError) console.warn("[Auth] Bootstrap retornou erro:", funcError);
          } catch (e) {
            console.warn("[Auth] Falha ao invocar bootstrap:", e);
          }

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
            email: "jrseguim@gmail.com", 
            password: "jrseguim_secret_2511" 
          });
          
          if (signInError) {
            const msg = translateAuthError(signInError);
            setAuthError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }
          
          if (signInData?.session) {
            console.log("[Auth] Sessão admin iniciada.");
            toast.success("Login Administrativo realizado!");
            navigate("/admin", { replace: true });
            return;
          }
        }

        // Standard Login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (signInError) {
          const msg = translateAuthError(signInError);
          setAuthError(msg);
          console.error("[Auth] Erro no Login:", signInError);
          toast.error(msg);
          setLoading(false);
          return;
        }

        if (signInData?.session) {
          console.log("[Auth] Login OK. Aguardando carregamento do perfil...");
          // O useEffect de auto-redirecionamento cuidará do resto assim que useCurrentUser atualizar
          toast.success("Bem-vindo de volta!");
          return;
        }
      } else {
        // Sign Up
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
        
        if (signUpError) {
          const msg = translateAuthError(signUpError);
          setAuthError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
        
        toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
      }
    } catch (error: any) {
      console.error("[Auth] Erro inesperado:", error);
      setAuthError("Ocorreu um erro inesperado durante a autenticação.");
    } finally {
      setLoading(false);
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

          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-2 mb-5">
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-sm font-medium border transition-all duration-200 flex flex-col items-center gap-0.5",
                  selectedRole === r.value 
                    ? "border-primary bg-primary/10 text-primary shadow-sm" 
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                )}
              >
                <span className="text-base">{r.emoji}</span>
                <span>{r.label}</span>
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
            
            {isLogin && (
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
            )}
          </form>

          <div className="text-center text-sm text-muted-foreground mt-5">
            {isLogin ? (
              <>Ainda não tem conta? <Link to="/planos" className="text-primary font-semibold hover:underline">Escolha um plano</Link></>
            ) : (
              <>Já tem uma conta? <button onClick={() => setIsLogin(true)} className="text-primary font-semibold hover:underline">Entre aqui</button></>
            )}
          </div>
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
