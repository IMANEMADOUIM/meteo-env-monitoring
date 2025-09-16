import mongoose from 'mongoose';
import UserModel from '../../models/userModel';
import { thirtyDaysFromNow } from './date';
import SessionModel from '../../models/sessionModel';


export async function createUserSession(userId: string, ipAddress: string, userAgent?: string) {
  try {
    if (!userId || !ipAddress) {
      throw new Error('userId and ipAddress are required');
    }

    // Vérification que l'utilisateur existe (optionnelle)
    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      throw new Error("User not found");
    }



    const sessionData = {
      userId: new mongoose.Types.ObjectId(userId),
      ipAddress: ipAddress,
      userAgent: userAgent || null,
      isValid: true,
      lastActivity: new Date(),
      expiredAt: thirtyDaysFromNow(),
    };

    const session = await SessionModel.create(sessionData);

    
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      throw new Error(`Session validation failed: ${validationErrors.join(', ')}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unknown error occurred while creating session');
  }
}