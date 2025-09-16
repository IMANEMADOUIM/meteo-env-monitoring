// src/pages/HistoryPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  RefreshCw,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { QuickActionCard } from "../components/QuickActionCard";

type WeatherHistoryItem = {
  dt: number;
  temp: number;
  humidity: number;
  windSpeed: number;
};

type AirHistoryItem = {
  dt: number;
  aqi: number;
};

const fetcher = (url: string) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    .then((r) => r.data);

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Weather history
  const { data: weatherHistory, refetch: refetchWeather } = useQuery<WeatherHistoryItem[]>(
    ["history", "weather", startDate, endDate],
    () => fetcher(`/history/weather?start=${startDate}&end=${endDate}`)
  );

  // Air quality history
  const { data: airHistory, refetch: refetchAir } = useQuery<AirHistoryItem[]>(
    ["history", "air", startDate, endDate],
    () => fetcher(`/history/air?start=${startDate}&end=${endDate}`)
  );

  const weatherData = useMemo(
    () =>
      weatherHistory?.map((w) => ({
        time: new Date(w.dt * 1000).toLocaleDateString(),
        temp: w.temp,
        humidity: w.humidity,
        wind: w.windSpeed,
      })) || [],
    [weatherHistory]
  );

  const airData = useMemo(
    () =>
      airHistory?.map((a) => ({
        time: new Date(a.dt * 1000).toLocaleDateString(),
        aqi: a.aqi,
      })) || [],
    [airHistory]
  );

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const handleRefresh = () => {
    refetchWeather();
    refetchAir();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-500" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Historique Météo & Qualité de l'air
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Visualisez et comparez vos données environnementales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600"
            />
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <RefreshCw size={16} />
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

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <QuickActionCard
            title="Météo Historique"
            description="Température, humidité, vent"
            icon={<Calendar className="text-blue-500" size={28} />}
            color="from-blue-50 to-blue-100"
            gradient="from-blue-500 to-blue-600"
            onClick={() => navigate("/weather-history")}
          />
          <QuickActionCard
            title="Air Historique"
            description="AQI et polluants"
            icon={<Calendar className="text-emerald-500" size={28} />}
            color="from-emerald-50 to-emerald-100"
            gradient="from-emerald-500 to-emerald-600"
            onClick={() => navigate("/air-history")}
          />
        </div>

        {/* Charts grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weather charts */}
          <section className="lg:col-span-6 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                Température & Humidité
              </h2>
              <div style={{ height: 250 }}>
                {weatherData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weatherData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-500 pt-12">
                    Aucune donnée météo historique
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Air quality charts */}
          <section className="lg:col-span-6 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/70 p-6 rounded-2xl shadow-lg border">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                AQI Historique
              </h2>
              <div style={{ height: 250 }}>
                {airData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={airData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="aqi"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-500 pt-12">
                    Aucune donnée AQI historique
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage
