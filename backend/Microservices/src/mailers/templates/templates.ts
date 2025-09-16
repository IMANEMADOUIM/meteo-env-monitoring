export const verifyEmailTemplate = (
  url: string,
  brandColor: string = "#00845D"  // Vert OCP principal
) => ({
  subject: "Confirmez votre compte Squeezy",
  text: `Veuillez vérifier votre adresse email en cliquant sur le lien suivant: ${url}`,
  html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #E4F4EF;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <div style="max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <div style="background-color: #00845D; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">OCP</h1>
              </div>
              
              <!-- Content -->
              <div style="background-color: white; padding: 30px; border-left: 1px solid #007451; border-right: 1px solid #007451;">
                <h2 style="color: #00845D; font-size: 20px; margin-top: 0; margin-bottom: 20px; text-align: center;">Confirmez Votre Adresse Email</h2>
                <p style="color: #333; font-size: 16px; line-height: 24px; margin-bottom: 25px;">
                  Merci de vous être inscrit ! Veuillez confirmer votre compte en cliquant sur le bouton ci-dessous.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" target="_blank" style="background-color: #00845D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Confirmer le compte</a>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 25px;">
                  Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; border-left: 1px solid #007451; border-right: 1px solid #007451; border-bottom: 1px solid #007451;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Si vous avez des questions, n'hésitez pas à répondre à cet email ou à contacter notre équipe d'assistance.
                </p>
                <div style="margin-top: 10px;">
                  <span style="display: inline-block; width: 30px; height: 5px; background-color: #008E5B; margin-right: 5px;"></span>
                  <span style="display: inline-block; width: 30px; height: 5px; background-color: #00845D; margin-right: 5px;"></span>
                  <span style="display: inline-block; width: 30px; height: 5px; background-color: #007451;"></span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
});

export const passwordResetTemplate = (
  url: string,
  brandColor: string = "#00845D"  // Vert OCP principal
) => ({
  subject: "Réinitialisez Votre Mot de Passe",
  text: `Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant: ${url}`,
  html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #E4F4EF;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <div style="max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <div style="background-color: #00845D; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">OCP</h1>
              </div>
              
              <!-- Content -->
              <div style="background-color: white; padding: 30px; border-left: 1px solid #007451; border-right: 1px solid #007451;">
                <h2 style="color: #00845D; font-size: 20px; margin-top: 0; margin-bottom: 20px; text-align: center;">Réinitialisez Votre Mot de Passe</h2>
                <p style="color: #333; font-size: 16px; line-height: 24px; margin-bottom: 25px;">
                  Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder à la réinitialisation.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" target="_blank" style="background-color: #00845D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Réinitialiser le mot de passe</a>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 25px;">
                  Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet email en toute sécurité.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; border-left: 1px solid #007451; border-right: 1px solid #007451; border-bottom: 1px solid #007451;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Si vous avez des questions, n'hésitez pas à répondre à cet email ou à contacter notre équipe d'assistance.
                </p>
                <div style="margin-top: 10px;">
                  <span style="display: inline-block; width: 30px; height: 5px; background-color: #008E5B; margin-right: 5px;"></span>
                  <span style="display: inline-block; width: 30px; height: 5px; background-color: #00845D; margin-right: 5px;"></span>
                  <span style="display: inline-block; width: 30px; height: 5px; background-color: #007451;"></span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
});