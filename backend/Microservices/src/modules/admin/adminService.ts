import { NotFoundException, BadRequestException } from '../../exceptions/exceptions';
import UserModel, { UserDocument } from '../../models/userModel';
import SessionModel from '../../models/sessionModel';
import mongoose from 'mongoose';
import { hashValue } from '../../common/utils/bcypt';
import Audience from '../../common/constants/audience';


interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: Audience;
  isEmailVerified?: boolean;
  emailNotification?: boolean;
  enable2FA?: boolean;
  isActive?: boolean; 
  isLocked?: boolean;
  credentialsExpired?: boolean;
}

export class AdminService {
  public async findAllUsers(
    username?: string,
    email?: string,
    role?: Audience,
    isEmailVerified?: boolean,
    page: number = 1,
    limit: number = 10
  ) {
    const query: any = {};
    
    if (username) query.username = { $regex: username, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (role) query.role = role;
    if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified;

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('-password -__v')
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query)
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  public async findUserById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await UserModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  public async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role?: Audience;
    isEmailVerified?: boolean;
    emailNotification?: boolean;
  }) {
    // Vérifier si l'email est déjà utilisé
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Créer un nouvel utilisateur
    const user = new UserModel({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      isEmailVerified: userData.isEmailVerified || false,
      userPreferences: {
        emailNotification: userData.emailNotification !== undefined ? userData.emailNotification : true,
        verificationStatus: userData.isEmailVerified ? 'verified' : 'pending'
      }
    });

    await user.save();
    return user;
  }

  public async updateUser(id: string, updateData: UserUpdate) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mettre à jour les champs directs
    if (updateData.username) user.username = updateData.username;
    if (updateData.email) user.email = updateData.email;
    if (updateData.password) user.password = await hashValue(updateData.password);
    if (updateData.role) user.role = updateData.role;
    if (updateData.isEmailVerified !== undefined) {
      user.isEmailVerified = updateData.isEmailVerified;
      
      // Mettre à jour également le statut de vérification dans les préférences
      if (!user.userPreferences) {
        user.userPreferences = {
          emailNotification: true,
          verificationStatus: updateData.isEmailVerified ? 'verified' : 'pending'
        };
      } else {
        user.userPreferences.verificationStatus = updateData.isEmailVerified ? 'verified' : 'pending';
      }
    }

    // Mettre à jour les préférences utilisateur
    if (!user.userPreferences) {
      user.userPreferences = {
        emailNotification: updateData.emailNotification !== undefined ? updateData.emailNotification : true,
        enable2FA: updateData.enable2FA !== undefined ? updateData.enable2FA : false,
        verificationStatus: user.isEmailVerified ? 'verified' : 'pending'
      };
    } else {
      if (updateData.emailNotification !== undefined) {
        user.userPreferences.emailNotification = updateData.emailNotification;
      }
      if (updateData.enable2FA !== undefined) {
        user.userPreferences.enable2FA = updateData.enable2FA;
      }
    }

    await user.save();
    const updatedUser = user.toObject() as Record<string, any>;
    delete updatedUser.password;
    return updatedUser;
  }

  public async deleteUser(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Supprimer également toutes les sessions associées à l'utilisateur
    await Promise.all([
      UserModel.deleteOne({ _id: id }),
      SessionModel.deleteMany({ userId: id })
    ]);

    return { success: true };
  }

  public async getUsersWithSessionStatus(
    role?: string,
    isVerified?: boolean,
    hasActiveSession?: boolean,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    
    // Construction du pipeline d'agrégation
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'sessions',
          localField: '_id',
          foreignField: 'userId',
          as: 'sessions'
        }
      },
      {
        $addFields: {
          hasActiveSession: { $gt: [{ $size: '$sessions' }, 0] }
        }
      }
    ];
    
    // Filtres
    const matchStage: any = {};
    if (role) matchStage.role = role;
    if (isVerified !== undefined) matchStage.isEmailVerified = isVerified;
    if (hasActiveSession !== undefined) matchStage.hasActiveSession = hasActiveSession;
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Comptage total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await UserModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    
    // Récupération des utilisateurs
    pipeline.push(
      { $skip: skip },
      { $limit: limit },
      { 
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          role: 1,
          isEmailVerified: 1,
          location : 1,
          userPreferences: 1,
          hasActiveSession: 1,
          sessions: { $size: '$sessions' },
          createdAt: 1,
          updatedAt: 1
        }
      }
    );
    
    const users = await UserModel.aggregate(pipeline);
    
    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  public async invalidateUserSessions(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Supprimer toutes les sessions de l'utilisateur
    await SessionModel.deleteMany({ userId });

    return { success: true };
  }

  public async getDashboardData() {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      unverifiedUsers,
      recentUsers,
      activeSessions
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ isEmailVerified: true }),
      UserModel.countDocuments({ role: 'admin' }),
      UserModel.countDocuments({ isEmailVerified: false }),
      UserModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password -__v'),
      SessionModel.countDocuments()
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      unverifiedUsers,
      activeSessions,
      recentUsers
    };
  }
}