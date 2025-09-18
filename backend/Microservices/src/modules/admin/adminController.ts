import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { OK } from '../../common/constants/http';
import { NotFoundException, BadRequestException } from '../../exceptions/exceptions';
import { AdminService } from './adminService';
import Audience from '../../common/constants/audience';

export class AdminController {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  public getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const filters = z.object({
      username: z.string().optional(),
      email: z.string().optional(),
      role: z.enum([Audience.Admin, Audience.User]).optional(),
      isEmailVerified: z.boolean().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10)
    }).parse(req.query);

    const { users, total, pages } = await this.adminService.findAllUsers(
      filters.username,
      filters.email,
      filters.role,
      filters.isEmailVerified,
      filters.page,
      filters.limit
    );

    return res.status(OK).json({
      message: "Users retrieved successfully",
      users,
      pagination: {
        total,
        page: filters.page,
        pages
      }
    });
  });

  public getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = z.string().parse(req.params.id);
    const user = await this.adminService.findUserById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return res.status(OK).json({
      message: "User retrieved successfully",
      user
    });
  });

  public createUser = asyncHandler(async (req: Request, res: Response) => {
    const createUserSchema = z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
      email: z.string().email(),
      password: z.string().min(6).max(32),
      role: z.enum([Audience.Admin, Audience.User]).default(Audience.User),
      emailNotification: z.boolean().default(true),
      isEmailVerified: z.boolean().default(false)
    });

    const userData = createUserSchema.parse(req.body);
    const user = await this.adminService.createUser(userData);

    return res.status(OK).json({
      message: "User created successfully",
      user: user.omitPassword()
    });
  });

  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = z.string().parse(req.params.id);
    
    const updateUserSchema = z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).max(32).optional(),
      role: z.enum([Audience.Admin, Audience.User]).optional(),
      emailNotification: z.boolean().optional(),
      isEmailVerified: z.boolean().optional(),
      enable2FA: z.boolean().optional(),
      isActive: z.boolean().optional(),
      isLocked: z.boolean().optional(),
      credentialsExpired: z.boolean().optional()
    });

    const updateData = updateUserSchema.parse(req.body);
    const updatedUser = await this.adminService.updateUser(userId, updateData);

    return res.status(OK).json({
      message: "User updated successfully",
      user: updatedUser
    });
  });

  public deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = z.string().parse(req.params.id);
    await this.adminService.deleteUser(userId);

    return res.status(OK).json({
      message: "User deleted successfully"
    });
  });

  public getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.adminService.getDashboardData();

    return res.status(OK).json({
      message: "Dashboard data retrieved successfully",
      stats
    });
  });

  public getUsersWithSessionStatus = asyncHandler(async (req: Request, res: Response) => {
    const filters = z.object({
      role: z.enum([Audience.Admin, Audience.User]).optional(),
      isVerified: z.boolean().optional(),
      hasActiveSession: z.boolean().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10)
    }).parse(req.query);
    
    const { users, total, pages } = await this.adminService.getUsersWithSessionStatus(
      filters.role,
      filters.isVerified,
      filters.hasActiveSession,
      filters.page,
      filters.limit
    );
    
    return res.status(OK).json({
      message: "Users retrieved successfully",
      users,
      pagination: {
        total,
        page: filters.page,
        pages
      }
    });
  });

  public forceLogout = asyncHandler(async (req: Request, res: Response) => {
    const userId = z.string().parse(req.params.userId);
    
    await this.adminService.invalidateUserSessions(userId);
    
    return res.status(OK).json({
      message: "User sessions invalidated successfully"
    });
  });
}