import { Router } from 'express';
import { getCurrentMeteo, getForecast } from './meteoController';


const router = Router();

router.get('/current', getCurrentMeteo);
router.get('/forecast', getForecast);

export default router;
