"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  username: string;
  rol: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

// ✅ Leer auth inicial del localStorage (solo cliente)
const getInitialAuth = () => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null };
  }

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    try {
      return { isAuthenticated: true, user: JSON.parse(userData) as User };
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
  return { isAuthenticated: false, user: null };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState(getInitialAuth);
  const router = useRouter();

  // ✅ Login con toast de bienvenida
  const login = useCallback((token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ isAuthenticated: true, user });

    toast.success(`Bienvenido, ${user.username}`, {
      description: "Has iniciado sesión correctamente",
      duration: 3000,
    });
  }, []);

  // ✅ Logout con toast de despedida
  const logout = useCallback(() => {
    // 1. Toast de despedida (antes de limpiar)
    toast.info("Cerrando sesión...", {
      description: "Hasta pronto 👋",
      duration: 2000,
    });

    // 2. Limpiar storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // 3. Limpiar estado
    setAuth({ isAuthenticated: false, user: null });

    // 4. Redirigir reemplazando la historia (evita volver atrás)
    router.replace("/login");

    // 5. Recargar para limpiar caché de componentes
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);