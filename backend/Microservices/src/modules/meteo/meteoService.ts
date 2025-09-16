import axios from 'axios';
import { IMeteo, Meteo } from '../../models/meteoModel';


const API_KEYS = {
  openweather: process.env.OPENWEATHER_API_KEY,
  weatherapi: process.env.WEATHERAPI_KEY,
  // NOAA or others
};

export const getMeteoFromAPI = async (lat: number, lon: number, provider: string) => {
  let url = '';
  if (provider === 'openweather') {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEYS.openweather}&units=metric`;
  } else if (provider === 'weatherapi') {
    url = `http://api.weatherapi.com/v1/current.json?key=${API_KEYS.weatherapi}&q=${lat},${lon}`;
  }
  const res = await axios.get(url);
  // Adapter la structure à Meteo
  const data = res.data;
  return {
    temperature: data.main?.temp || data.current?.temp_c,
    temperatureRessentie: data.main?.feels_like || data.current?.feelslike_c,
    humidite: data.main?.humidity || data.current?.humidity,
    pression: data.main?.pressure || data.current?.pressure_mb,
    description: data.weather?.[0]?.description || data.current?.condition?.text,
    icone: data.weather?.[0]?.icon || data.current?.condition?.icon,
    vitesseVent: data.wind?.speed || data.current?.wind_kph / 3.6,
    directionVent: data.wind?.deg || data.current?.wind_degree,
    ville: data.name || data.location?.name,
    pays: data.sys?.country || data.location?.country,
    typeMeteo: 'ACTUELLE',
    dateCreation: new Date(),
  } as IMeteo;
};

export const saveMeteo = async (userId: string, meteo: IMeteo) => {
  const newMeteo = new Meteo({ ...meteo, userId });
  await newMeteo.save();
  return newMeteo;
};

export const getMeteoHistorique = async (userId: string) => {
  return Meteo.find({ userId }).sort({ dateCreation: -1 }).limit(50);
};
