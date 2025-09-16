import { MfaController } from "./mfaController";
import { MfaService } from "./mfaService ";


const mfaService = new MfaService();
const mfaController = new MfaController(mfaService);

export { mfaService, mfaController };