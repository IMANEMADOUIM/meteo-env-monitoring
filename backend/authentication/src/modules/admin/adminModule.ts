import { AdminController } from "./adminController";
import { AdminService } from "./adminService";

const adminService = new AdminService ;
const adminController = new AdminController(adminService);

export { adminService, adminController };