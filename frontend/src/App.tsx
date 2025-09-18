import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Pages d'authentification
import { LoginPage } from "./pages/(auth)/LoginPage";
import { RegisterPage } from "./pages/(auth)/RegisterPage";
import { ForgotPasswordPage } from "./pages/(auth)/ForgotPasswordPage";
import ResetPasswordPage from "./pages/(auth)/ResetPasswordPage";
import ConfirmAccountPage from "./pages/(auth)/ConfirmAccountPage";
import VerifyMFAPage from "./pages/(auth)/VerifyMFAPage";

// Pages admin
import AdminSessions from "./pages/(admin)/AdminSessions";
import UsersPage from "./pages/(admin)/UsersPage";

// Pages utilisateur
import AddUserPage from "./pages/(user)/AddUserPage";
import EditUserPage from "./pages/(user)/EditUserPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import AirQualityPage from "./pages/AirQualityPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import WeatherPage from "./pages/WeatherPage";
import AdminRoute from "./routes/AdminRoute";

function App() {
  const navigate = useNavigate();
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes d'authentification (accessibles sans être connecté) */}
        <Route path="/login" element={<RegisterPage onSwitchToLogin={() => navigate("/login")} />} />
        <Route path="/register" element={<LoginPage onSwitchToRegister={() => navigate("/register")} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/confirm-account/:token" element={<ConfirmAccountPage />} />
        <Route path="/verify-mfa" element={<VerifyMFAPage />} />

        {/* Routes protégées (nécessitent une connexion) */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/air-quality" element={<ProtectedRoute><AirQualityPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />

        {/* Routes admin (nécessitent le rôle admin) */}
        <Route path="/admin/sessions" element={<AdminRoute><AdminSessions /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="/admin/add-user" element={<AdminRoute><AddUserPage /></AdminRoute>} />
        <Route path="/admin/edit-user/:id" element={<AdminRoute><EditUserPage /></AdminRoute>} />

        {/* Route de fallback pour les pages non trouvées */}
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;