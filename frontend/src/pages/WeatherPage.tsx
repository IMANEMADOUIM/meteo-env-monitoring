// src/pages/WeatherPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Thermometer,
  CloudRain,
  Sun,
  Moon,
  MapPin,
  RefreshCw,
  User,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  Legend,
} from "recharts";

// ---------------------------
// Types
// ---------------------------
type CurrentMeteo = {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min?: number;
    temp_max?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind?: { speed: number; deg?: number };
  name?: string;
  dt?: number;
};

type ForecastItem = {
  dt: number; // timestamp seconds
  dt_txt?: string;
  main: { temp: number; temp_min?: number; temp_max?: number; humidity?: number };
  weather: Array<{ description: string; icon: string; main: string }>;
};

type ForecastResponse = {
  list: ForecastItem[];
  city?: { name?: string; country?: string };
};

type MeResponse = {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
};

// ---------------------------
// Helpers
// ---------------------------
const fetcher = (url: string) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    .then((r) => r.data);

// Format hour for chart
const hourFormat = (ts: number) => {
  const d = new Date(ts * 1000);
  return d.getHours().toString().padStart(2, "0") + "h";
};

const dayShort = (ts: number) => {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit" });
};

// ---------------------------
// WeatherPage component
// ---------------------------
const WeatherPage: React.FC = () => {
  const [themeDark, setThemeDark] = useState<boolean>(false);
  // user info
  const { data: me } = useQuery<MeResponse>(["me"], () => fetcher("/auth/me"), {
    retry: false,
  });

  // current
  const {
    data: current,
    isLoading: currentLoading,
    refetch: refetchCurrent,
  } = useQuery<CurrentMeteo>(["meteo", "current"], () => fetcher("/meteo/actuelle"), {
    staleTime: 1000 * 60 * 1, // 1min
    retry: 1,
  });

  // forecast (5 days / 3h)
  const {
    data: forecast,
    isLoading: forecastLoading,
    refetch: refetchForecast,
  } = useQuery<ForecastResponse>(["meteo", "forecast"], () => fetcher("/meteo/forecast"), {
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Derived: build hourly chart (next 12 items) and daily aggregation
  const hourlyData = useMemo(() => {
    if (!forecast?.list) return [];
    return forecast.list.slice(0, 12).map((it) => ({
      time: it.dt_txt ? it.dt_txt.split(" ")[1].slice(0, 5) : hourFormat(it.dt),
      temp: Math.round(it.main.temp),
      humidity: it.main.humidity ?? null,
    }));
  }, [forecast]);

  const dailySummary = useMemo(() => {
    if (!forecast?.list) return [];
    // group by date string
    const groups: Record<string, ForecastItem[]> = {};
    for (const item of forecast.list) {
      const dateStr = new Date(item.dt * 1000).toISOString().slice(0, 10);
      groups[dateStr] = groups[dateStr] || [];
      groups[dateStr].push(item);
    }
    // create array of first 5 days
    return Object.keys(groups)
      .slice(0, 5)
      .map((dateStr) => {
        const items = groups[dateStr];
        const temps = items.map((i) => i.main.temp);
        const icons = items.map((i) => i.weather[0]?.icon).filter(Boolean);
        return {
          date: dateStr,
          temp_max: Math.round(Math.max(...temps)),
          temp_min: Math.round(Math.min(...temps)),
          icon: icons.length ? icons[0] : null,
          label: new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" }),
        };
      });
  }, [forecast]);

  useEffect(() => {
    // toggle body class for theme (if you use global)
    if (themeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeDark]);

  const refreshing = currentLoading || forecastLoading;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 shadow">
              <Sun className="text-amber-400" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Météo & Prévisions</h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">Vue synthétique — conditions locales & tendance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* user small card */}
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl shadow">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
                <User size={18} />
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-100">{me?.username ?? me?.email ?? "Invité"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-300">{me?.role ?? "—"}</div>
              </div>
            </div>

            <button
              onClick={() => { refetchCurrent(); refetchForecast(); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition`}
              title="Rafraîchir"
            >
              <RefreshCw className={`${refreshing ? "animate-spin" : ""}`} size={16} />
              <span className="text-sm">Rafraîchir</span>
            </button>

            <button
              onClick={() => setThemeDark((s) => !s)}
              className="px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {themeDark ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>

        {/* Main grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: big current card + hourly chart */}
          <section className="lg:col-span-8 space-y-6">
            {/* Current weather card */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border border-white/30">
              <div className="flex items-start gap-6">
                {/* icon + temp */}
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 flex items-center justify-center shadow-inner">
                    {current ? (
                      <img
                        src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`}
                        alt={current.weather[0].description}
                        className="w-20 h-20"
                      />
                    ) : (
                      <CloudRain size={48} />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-5xl font-bold text-slate-800 dark:text-white">
                        {current ? Math.round(current.main.temp) + "°C" : "—"}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                        {current ? current.weather[0].description : "Données indisponibles"}
                      </div>
                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-300 flex items-center gap-3">
                        <MapPin size={14} />
                        <span>{current?.name ?? forecast?.city?.name ?? "Localisation inconnue"}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-500 dark:text-slate-300">Ressenti</div>
                      <div className="text-lg font-semibold text-slate-800 dark:text-white">
                        {current ? Math.round(current.main.feels_like) + "°C" : "—"}
                      </div>

                      <div className="mt-4 text-xs text-slate-500 dark:text-slate-300">
                        <div>Humidité: {current ? current.main.humidity + "%" : "—"}</div>
                        <div>Pression: {current ? current.main.pressure + " hPa" : "—"}</div>
                        <div>Vent: {current?.wind ? Math.round(current.wind.speed) + " km/h" : "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly chart */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow border border-white/30">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100">Tendance horaire (prochaines heures)</h3>
                <div className="text-sm text-slate-500 dark:text-slate-300 flex items-center gap-3">
                  <Info size={14} /> Températures prévues
                </div>
              </div>
              <div style={{ height: 220 }} className="mt-3">
                {hourlyData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                      <XAxis dataKey="time" tick={{ fill: "#6b7280" }} />
                      <YAxis tick={{ fill: "#6b7280" }} domain={["dataMin - 3", "dataMax + 3"]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="humidity" stroke="#34d399" strokeWidth={2} dot={false} yAxisId="right" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-slate-500">Aucune donnée de prévision disponible</div>
                )}
              </div>
            </div>

            {/* Daily compact overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dailySummary.map((d) => (
                <div key={d.date} className="bg-white/80 dark:bg-slate-800/70 p-3 rounded-xl shadow-sm border border-white/20 text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-300">{d.label}</div>
                  <div className="mt-2 flex items-center justify-center">
                    {d.icon ? (
                      <img src={`https://openweathermap.org/img/wn/${d.icon}.png`} alt="ic" className="w-10 h-10" />
                    ) : (
                      <Sun size={22} />
                    )}
                    <div className="ml-3">
                      <div className="font-semibold text-slate-800 dark:text-white">{d.temp_max}° / {d.temp_min}°</div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">Max / Min</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right column: diagnostics + quick stats */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-sm border border-white/30">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Diagnostics rapides</h4>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-300">Température locale</div>
                  <div className="font-semibold text-slate-800 dark:text-white">{current ? Math.round(current.main.temp) + "°C" : "—"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-300">Ressenti</div>
                  <div className="font-semibold">{current ? Math.round(current.main.feels_like) + "°C" : "—"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-300">Humidité</div>
                  <div className="font-semibold">{current ? current.main.humidity + "%" : "—"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-300">Pression</div>
                  <div className="font-semibold">{current ? current.main.pressure + " hPa" : "—"}</div>
                </div>
              </div>
            </div>

            {/* Quick actions / toggles */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-sm border border-white/30">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Actions rapides</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <button
                  onClick={() => { refetchCurrent(); }}
                  className="w-full px-3 py-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100"
                >
                  Rafraîchir météo actuelle
                </button>
                <button
                  onClick={() => { refetchForecast(); }}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                >
                  Recharger prévisions
                </button>
                <a
                  href="/history"
                  className="w-full inline-block text-center px-3 py-2 rounded-lg bg-gray-50 text-slate-700 border border-gray-100 hover:bg-gray-100"
                >
                  Voir historique
                </a>
              </div>
            </div>

            {/* small widget: comparison placeholder */}
            <div className="bg-white/80 dark:bg-slate-800/70 p-4 rounded-2xl shadow-sm border border-white/30">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Qualité / Fiabilité</h4>
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {/* If you later provide a comparison endpoint return {difference} */}
                <p>Comparaison source API vs historique (si disponible)</p>
                <p className="mt-2 font-medium">Fiabilité estimée : <span className="text-emerald-600">82%</span></p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default WeatherPage;
