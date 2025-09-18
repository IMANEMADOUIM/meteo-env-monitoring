interface Props {
  data: {
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
    aqi: number;
    collectedAt: string;
  };
}

export default function LatestCard({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Dernière mesure</h2>
      <ul className="grid grid-cols-2 gap-3 text-slate-600">
        <li>PM2.5 : <b>{data.pm2_5}</b></li>
        <li>PM10 : <b>{data.pm10}</b></li>
        <li>NO₂ : <b>{data.no2}</b></li>
        <li>O₃ : <b>{data.o3}</b></li>
        <li>CO : <b>{data.co}</b></li>
        <li>AQI : <b>{data.aqi}</b></li>
      </ul>
      <p className="mt-3 text-sm text-slate-400">
        Reçu à {new Date(data.collectedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
