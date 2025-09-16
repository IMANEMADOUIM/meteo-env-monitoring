// src/pages/AirQualityPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud,
  Wind,
  AlertTriangle,
  RefreshCw,
  User,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

type MeResponse = {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
};

type AirQualityCurrent = {
  aqi: number;
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  dt: number;
  location?: string;
};

type AirQualityHistoryItem = {
  aqi: number;
  dt: number;
};

const fetcher = (url: string) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    .then((r) => r.data);

const aqiColor = (aqi: number) => {
  if (aqi <= 50) return "text-emerald-600";
  if (aqi <= 100) return "text-yellow-500";
  if (aqi <= 150) return "text-orange-500";
  if (aqi <= 200) return "text-red-500";
  if (aqi <= 300) return "text-purple-600";
  return "text-rose-700";
};

const AirQualityPage: React.FC = () => {
  const [dark, setDark] = useState(false);

  const { data: me } = useQuery<MeResponse>(["me"], () => fetcher("/auth/me"));

  const {
    data: current,
    isLoading: loadingCurrent,
    refetch: refetchCurrent,
  } = useQuery<AirQualityCurrent>(["air", "current"], () =>
    fetcher("/air/quality/current")
  );

  const {
    data: history,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useQuery<AirQualityHistoryItem[]>(["air", "history"], () =>
    fetcher("/air/quality/history")
  );

  const historyData = useMemo(() => {
    return (
      history?.map((h) => ({
        time: new Date(h.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        aqi: h.aqi,
      })) || []
    );
  }, [history]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const refreshing = loadingCurrent || loadingHistory;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="text-sky-600" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Qualité de l’air
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Indice AQI et polluants atmosphériques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl shadow">
              <User size={18} />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {me?.username ?? me?.email ?? "Invité"}
              </span>
            </div>
            <button
              onClick={() => {
                refetchCurrent();
                refetchHistory();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <RefreshCw
                className={refreshing ? "animate-spin" : ""}
                size={16}
              />
              Rafraîchir
            </button>
            <button
              onClick={() => setDark((s) => !s)}
              className="px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border"
            >
              {dark ? "☾" : "☀"}
            </button>
          </div>
        </header>

        {/* Main grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side */}
          <section className="lg:col-span-8 space-y-6">
            {/* AQI Card */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    AQI Actuel
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {current?.location ?? "Localisation inconnue"}
                  </p>
                  <div
                    className={`mt-3 text-5xl font-bold ${aqiColor(
                      current?.aqi ?? 0
                    )}`}
                  >
                    {current ? current.aqi : "—"}
                  </div>
                </div>
                <Activity size={48} className="text-sky-400" />
              </div>
            </div>

            {/* Pollutants chart */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-lg border">
              <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Polluants atmosphériques (µg/m³)
              </h3>
              <div style={{ height: 240 }}>
                {current ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(current.components).map(
                        ([k, v]) => ({ name: k.toUpperCase(), value: v })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-500 pt-12">
                    Pas de données
                  </div>
                )}
              </div>
            </div>

            {/* History AQI chart */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-lg border">
              <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Historique AQI (24h)
              </h3>
              <div style={{ height: 220 }}>
                {historyData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="aqi"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-500 pt-12">
                    Aucune donnée historique
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right side */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-sm border">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                Diagnostic
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  Niveau actuel :{" "}
                  <span className={aqiColor(current?.aqi ?? 0)}>
                    {current?.aqi ?? "—"}
                  </span>
                </li>
                <li>CO₂ élevé : {current?.components.co ?? "—"} µg/m³</li>
                <li>PM2.5 : {current?.components.pm2_5 ?? "—"} µg/m³</li>
                <li>O₃ : {current?.components.o3 ?? "—"} µg/m³</li>
              </ul>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-sm border">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                Recommandations
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {current && current.aqi > 100
                  ? "⚠️ Limitez vos activités extérieures prolongées."
                  : "✔️ L’air est globalement sain pour vos activités."}
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default AirQualityPage;
