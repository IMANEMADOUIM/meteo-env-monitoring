"use client";

import  { createContext, useContext, useState, type ReactNode } from "react";
import useAuth from "../hooks/use-auth";


type UserType = {
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userPreferences: {
    enable2FA: boolean;
  };
};

type ToastType = {
  message: string;
  type: "success" | "warning" | "error";
  isVisible: boolean;
};

type AuthContextType = {
  user?: UserType;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  isLogin: boolean;
  toggleLogin: (value: boolean) => void;
  toast: ToastType;
  hideToast: () => void;
  handleLogin: (credentials: any) => Promise<void>;
  handleRegister: (userData: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, error, isLoading: backendLoading, isFetching, refetch } = useAuth();
  const user = data?.data?.user;

  const [isLoadingState, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [toast, setToast] = useState<ToastType>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const toggleLogin = (value: boolean) => setIsLogin(value);

  const showToast = (message: string, type: "success" | "warning" | "error") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleLogin = async (credentials: any) => {
    console.log("Login:", credentials);
    if (!credentials.email || !credentials.password) {
      showToast("Veuillez remplir tous les champs", "warning");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showToast("Connexion réussie !", "success");
    setIsLoading(false);
  };

  const handleRegister = async (userData: any) => {
    console.log("Register:", userData);
    if (!userData.username || !userData.email || !userData.password) {
      showToast("Veuillez remplir tous les champs", "warning");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showToast("Inscription réussie !", "success");
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        isLoading: backendLoading || isLoadingState,
        isFetching,
        refetch,
        isLogin,
        toggleLogin,
        toast,
        hideToast,
        handleLogin,
        handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
