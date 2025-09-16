import { AuthController } from "./authController";
import { AuthService } from "./authService";


const authService = new AuthService();
const authController = new AuthController(authService);

export { authService, authController };