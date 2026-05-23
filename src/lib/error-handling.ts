export const translateAuthError = (error: any): string => {
  if (!error) return "Ocorreu um erro inesperado.";
  
  const message = error.message || "";
  
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos. Por favor, tente novamente.";
  }
  
  if (message.includes("User already registered")) {
    return "Este e-mail já está cadastrado em nossa plataforma.";
  }
  
  if (message.includes("Password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  
  if (message.includes("Email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }

  if (message.includes("Too many requests")) {
    return "Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos.";
  }

  if (message.includes("rate limit")) {
    return "Limite de acessos atingido. Tente novamente em breve.";
  }

  return message || "Não foi possível completar a operação. Verifique sua conexão.";
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
