import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "help@3sdev.com.br",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}

// Template para Magic Link do Questionário
export function getMagicLinkEmailTemplate(
  nomeColaborador: string,
  magicLink: string,
  expiresAt: Date,
  empresaNome?: string,
  empresaLogo?: string,
  empresaCorPrimaria?: string
) {
  const expiresFormatted = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(expiresAt);

  const corPrimaria = empresaCorPrimaria || "#2563eb";
  const corEscura = empresaCorPrimaria
    ? `${empresaCorPrimaria}dd`
    : "#1e40af";

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Questionário VIVAMENTE360</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${corPrimaria} 0%, ${corEscura} 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        ${empresaLogo
          ? `<img src="${empresaLogo}" alt="${empresaNome || 'Logo'}" style="max-width: 150px; max-height: 60px; margin-bottom: 15px;" />`
          : ''
        }
        <h1 style="color: white; margin: 0;">VIVAMENTE360</h1>
        ${empresaNome
          ? `<p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">${empresaNome}</p>`
          : ''
        }
        <p style="color: #e0e7ff; margin: 10px 0 0 0;">Avaliação de Riscos Psicossociais</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Olá,</p>

        <p>Você foi convidado(a) a responder o <strong>Questionário HSE-IT de Avaliação de Riscos Psicossociais</strong>.</p>

        <p>Este questionário é anônimo e leva aproximadamente <strong>10 minutos</strong> para ser concluído. Suas respostas são confidenciais e serão utilizadas apenas para análises agregadas, respeitando totalmente a LGPD.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}"
             style="background: ${corPrimaria}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Responder Questionário
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          <strong>Importante:</strong> Este link é pessoal e intransferível. Ele expira em <strong>${expiresFormatted}</strong>.
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
          <span style="word-break: break-all; color: ${corPrimaria};">${magicLink}</span>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
        <p>© ${new Date().getFullYear()} VIVAMENTE360 - Todos os direitos reservados</p>
        <p>Conforme NR-1 • LGPD • GRO/PGR</p>
      </div>
    </body>
    </html>
  `;
}

// Template para Reset de Senha
export function getPasswordResetEmailTemplate(
  nomeUsuario: string,
  resetLink: string,
  expiresAt: Date
) {
  const expiresFormatted = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(expiresAt);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinir Senha - VIVAMENTE360</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">VIVAMENTE360</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0;">Redefinição de Senha</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Olá, <strong>${nomeUsuario}</strong></p>

        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Redefinir Senha
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          <strong>Este link expira em:</strong> ${expiresFormatted}
        </p>

        <p style="font-size: 14px; color: #ef4444; margin-top: 20px;">
          <strong>⚠️ Não solicitou esta alteração?</strong><br>
          Ignore este email. Sua senha permanecerá inalterada.
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
          <span style="word-break: break-all; color: #2563eb;">${resetLink}</span>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
        <p>© ${new Date().getFullYear()} VIVAMENTE360 - Todos os direitos reservados</p>
      </div>
    </body>
    </html>
  `;
}
