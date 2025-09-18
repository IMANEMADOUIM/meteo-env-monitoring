import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  rows: {
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
    aqi: number;
    collectedAt: string;
  }[];
}

export default function HistoryChart({ rows }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-[400px]">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Historique AQI</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={rows.slice().reverse()}>
          <XAxis dataKey="collectedAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
          <YAxis />
          <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
          <Legend />
          <Line type="monotone" dataKey="aqi" stroke="#3b82f6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
