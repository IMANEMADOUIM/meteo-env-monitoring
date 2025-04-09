import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoMemoryServer: MongoMemoryServer;

// Configuration des timeouts
jest.setTimeout(60000); // 60 secondes pour l'ensemble des tests

beforeAll(async () => {
  try {
    // Configuration du serveur MongoDB en mémoire
    mongoMemoryServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.8',
        downloadDir: './.cache/mongodb-memory-server',
      },
      instance: {
        dbName: 'testdb',
        port: 27017, // Port fixe pour éviter les conflits
      },
    });

    // Connexion avec paramètres optimisés
    await mongoose.connect(mongoMemoryServer.getUri(), {
      dbName: 'testdb',
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 10, // Limite le nombre de connexions
    });
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err);
    await globalTeardown();
    process.exit(1);
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }

  // Nettoyage ciblé des collections
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map(async (collection) => {
      try {
        await collection.deleteMany({});
      } catch (err) {
        console.error(
          `Erreur de nettoyage de la collection ${collection.collectionName}:`,
          err,
        );
      }
    }),
  );
});

afterAll(async () => {
  await globalTeardown();
});

// Fonction centrale de nettoyage
async function globalTeardown() {
  try {
    // Fermeture dans l'ordre inverse
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }

    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('❌ Erreur de nettoyage global:', err);
  } finally {
    // Force la fermeture des handles restants
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
