import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Bell,
  CloudRain,
  Activity,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

// --------------------- Types ---------------------
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  condition: string;
  forecast: { hour: string; temp: number }[];
}

interface AirQualityData {
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  aqi: number;
  lastUpdated: string;
}

interface Notification {
  id: string;
  type: "alert" | "info" | "warning";
  message: string;
  timestamp: string;
  read: boolean;
}

interface Stats {
  todayAlerts: number;
  avgAqi: number;
  weatherTrend: string;
  lastUpdate: string;
}

// --------------------- API hooks ---------------------
const fetchWeather = async (): Promise<WeatherData> => {
  const { data } = await axios.get("/api/meteo/current");
  return data;
};

const fetchAirQuality = async (): Promise<AirQualityData> => {
  const { data } = await axios.get("/api/air/live");
  return data;
};

const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await axios.get("/api/notifications");
  return data;
};

const fetchStats = async (): Promise<Stats> => {
  const { data } = await axios.get("/api/dashboard/stats");
  return data;
};

// --------------------- Dashboard ---------------------
const Dashboard: React.FC = () => {
  const { data: weather } = useQuery({ queryKey: ["weather"], queryFn: fetchWeather });
  const { data: air } = useQuery({ queryKey: ["air"], queryFn: fetchAirQuality });
  const { data: notifications } = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications });
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: fetchStats });

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-slate-100 via-white to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">EcoDashboard</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/dashboard" className="hover:text-blue-500">Accueil</Link>
          <Link to="/history" className="hover:text-blue-500">Historique</Link>
          <Link to="/alerts" className="hover:text-blue-500">Alertes</Link>
          <Link to="/users" className="hover:text-blue-500">Utilisateurs</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weather Card */}
        <section className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Thermometer className="mr-2 text-blue-500" /> Météo Actuelle
          </h3>
          {weather ? (
            <>
              <p className="text-2xl font-bold">{weather.temperature}°C - {weather.condition}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center"><Droplets className="mr-2 text-blue-400" /> {weather.humidity}%</div>
                <div className="flex items-center"><Wind className="mr-2 text-green-500" /> {weather.windSpeed} km/h</div>
                <div className="flex items-center"><Activity className="mr-2 text-purple-500" /> {weather.pressure} hPa</div>
                <div className="flex items-center"><Sun className="mr-2 text-orange-400" /> Ressenti {weather.feelsLike}°C</div>
                <div className="flex items-center">☀️ {weather.sunrise}</div>
                <div className="flex items-center">🌙 {weather.sunset}</div>
              </div>

              {/* Forecast Chart */}
              <div className="h-40 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weather.forecast}>
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p>Chargement...</p>
          )}
        </section>

        {/* Air Quality Card */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CloudRain className="mr-2 text-green-500" /> Qualité de l’air
          </h3>
          {air ? (
            <>
              <p className="text-2xl font-bold mb-2">AQI: {air.aqi}</p>
              <ul className="space-y-2">
                <li>PM2.5: {air.pm25}</li>
                <li>PM10: {air.pm10}</li>
                <li>NO₂: {air.no2}</li>
                <li>O₃: {air.o3}</li>
                <li>CO: {air.co}</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">Dernière mise à jour : {air.lastUpdated}</p>
            </>
          ) : (
            <p>Chargement...</p>
          )}
        </section>

        {/* Notifications */}
        <section className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Bell className="mr-2 text-red-500" /> Notifications
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {notifications?.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg shadow ${
                  n.type === "alert"
                    ? "bg-red-100 text-red-700"
                    : n.type === "warning"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <p className="font-medium">{n.message}</p>
                <span className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">📊 Statistiques</h3>
          {stats ? (
            <ul className="space-y-2">
              <li>Alertes du jour : {stats.todayAlerts}</li>
              <li>AQI moyen : {stats.avgAqi}</li>
              <li>Tendance météo : {stats.weatherTrend}</li>
              <li>Dernière maj : {stats.lastUpdate}</li>
            </ul>
          ) : (
            <p>Chargement...</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
