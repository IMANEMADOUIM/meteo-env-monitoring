import mongoose from 'mongoose';

module.exports = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  // Ajoutez ici le nettoyage d'autres ressources si nécessaire
};
