import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [thresholds, setThresholds] = useState({
    aqi: 120,
    pm10: 40,
    pm25: 20,
    no2: 180,
    o3: 160,
    co: 8,
  });
  const [message, setMessage] = useState("");

  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Charger settings initiaux
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTemperatureUnit(res.data.temperatureUnit || "C");
        setNotificationsEnabled(res.data.notificationsEnabled ?? false);
        setThresholds(res.data.thresholds);
      })
      .catch(() => setMessage("⚠️ Impossible de charger vos paramètres"));
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:5000/api/settings",
        { temperatureUnit, notificationsEnabled, thresholds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Paramètres sauvegardés");
    } catch {
      setMessage("❌ Erreur lors de l’enregistrement");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage("❌ Erreur lors du changement de mot de passe");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-6">
          Paramètres utilisateur ⚙️
        </h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* --- Onglet Account Info --- */}
          <TabsContent value="account">
            {/* Temperature Unit */}
            <div className="mb-6">
              <label className="block mb-2 font-medium text-slate-600">
                Unité de température
              </label>
              <div className="flex gap-4">
                {["C", "F"].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setTemperatureUnit(unit as "C" | "F")}
                    className={`px-4 py-2 rounded-lg border transition ${
                      temperatureUnit === unit
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 border-gray-300 text-slate-600 hover:bg-gray-200"
                    }`}
                  >
                    {unit === "C" ? "Celsius (°C)" : "Fahrenheit (°F)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-slate-700">
                Activer les notifications
              </span>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(thresholds).map(([key, value]) => (
                <div key={key}>
                  <label className="block mb-2 font-medium text-slate-600 capitalize">
                    {key}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [key]: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
              >
                Sauvegarder
              </button>
            </div>
          </TabsContent>

          {/* --- Onglet Security --- */}
          <TabsContent value="security">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-slate-600">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-slate-600">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-slate-600">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow"
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {message && (
          <div
            className={`mt-6 p-3 rounded-lg text-sm text-center ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
