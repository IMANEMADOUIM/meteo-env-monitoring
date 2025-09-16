import 'dotenv/config';
import app from './app';
import connectDB from './config/db';
import { NODE_ENV, PORT } from './common/constants/env';

const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log(' Connected to database.');

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(` Server listening on port ${PORT} in ${NODE_ENV} environment.`);
    });
  } catch (error) {
    console.error(' Error starting server:', error);
    process.exit(1); // Arrête le processus en cas d'erreur critique
  }

};

startServer();