import { SessionDocument } from "../../models/sessionModel";
import { UserDocument } from "../../models/userModel";
import Audience from "../common/constants/audience";

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id: mongoose.Types.ObjectId;
      role : Audience;
      email: string;
      password: string;
      username: string;
      isEmailVerified: boolean;
      userPreferences?: {
        enable2FA?: boolean;
        emailNotification: boolean;
        twoFactorSecret?: string;
        verificationStatus: string;
      };
    }

    interface Request {
      sessionId?: SessionDocument["_id"];
      user?: User;
    }
  }
}