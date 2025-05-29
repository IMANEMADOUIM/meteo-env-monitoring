import { MAILER_SENDER, NODE_ENV } from "../common/constants/env";
import { resend } from "./resendClient";


type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender =
  NODE_ENV === "development"
    ? `no-reply <onboarding@resend.dev>`
    : `no-reply <${MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) =>
  await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });