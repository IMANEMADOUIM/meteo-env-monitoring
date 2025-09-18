// src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Cloud } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "../../components/ThemeToggle";
import PasswordStrength from "../../components/PasswordStrength";
import { WeatherProLogo } from "../../components/WeatherProLogo";


interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Inscription avec:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <WeatherProLogo />
          <ThemeToggle />
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Tabs */}
          <div className="flex mb-8">
            <button
              onClick={onSwitchToLogin}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 py-3 px-4 rounded-l-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Connexion
            </button>
            <button className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-r-xl font-medium">
              Inscription
            </button>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              Créez votre compte
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Rejoignez WeatherPro et personnalisez vos données météo
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nom complet"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Adresse email"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mot de passe"
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* ✅ Validation dynamique */}
            <PasswordStrength password={formData.password} />

            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-medium hover:bg-emerald-600 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              S'inscrire
            </button>
          </form>

          {/* Décorations */}
          <Cloud className="absolute bottom-4 left-4 w-6 h-6 text-emerald-200 opacity-60" />
          <Cloud className="absolute top-4 right-4 w-4 h-4 text-blue-200 opacity-60" />
        </div>
      </motion.div>
    </div>
  );
};
