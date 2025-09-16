import { Request, Response } from 'express';
import { getMeteoFromAPI, getMeteoHistorique, saveMeteo } from './meteoService';


export const getCurrentMeteo = async (req: Request, res: Response) => {
  const { userId, source = 'openweather' } = req.query;
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!lat || !lon) return res.status(400).send('Latitude et longitude requises');

  try {
    const meteo = await getMeteoFromAPI(lat, lon, source as string);
    await saveMeteo(userId as string, meteo);
    res.json(meteo);
  } catch (err) {
    res.status(500).json({ error: 'Erreur API météo' });
  }
};

export const getForecast = async (req: Request, res: Response) => {
  const { userId } = req.query;
  const historique = await getMeteoHistorique(userId as string);
  res.json(historique); // Pour simulation on renvoie les historiques
};
