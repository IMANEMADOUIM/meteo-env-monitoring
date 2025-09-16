import axios from 'axios';

export type MeteoData = {
  temperature: number;
  temperatureRessentie: number;
  humidite: number;
  pression: number;
  description: string;
  icone: string;
  vitesseVent: number;
  directionVent?: number;
  ville: string;
  pays: string;
  dateCreation: string;
};

export const fetchMeteoActuelle = async (source: 'api' | 'db') => {
  const res = await axios.get(`/api/meteo/current?source=${source}`);
  return res.data as MeteoData;
};

export const fetchPrevisions = async () => {
  const res = await axios.get(`/api/meteo/forecast`);
  return res.data as MeteoData[];
};
