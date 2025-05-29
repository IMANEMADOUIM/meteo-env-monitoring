import { Resend } from "resend";
import { RESEND_API_KEY } from "../common/constants/env";

export const resend = new Resend(RESEND_API_KEY);