import { CONSENT_VERSION, WHATSAPP_CONSENT_STATEMENT } from '../../lib/consent';

export const maxDuration = 15;

// Proxy para o cadastro do EngajaBR — mantém a API key no servidor.
// Variável de ambiente obrigatória: ENGAJABR_API_KEY
export async function POST(req: Request) {
  const apiKey = process.env.ENGAJABR_API_KEY;
  if (!apiKey) {
    return Response.json(
      { success: false, message: 'Cadastro indisponível no momento. Tente novamente mais tarde.' },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, message: 'Dados de cadastro inválidos.' },
      { status: 400 }
    );
  }

  const { name, phone, email, birth, city, whatsappConsent, consentVersion } = body;

  if (!name || !phone) {
    return Response.json(
      { success: false, message: 'Nome e WhatsApp são obrigatórios.' },
      { status: 400 }
    );
  }

  if (whatsappConsent !== true || consentVersion !== CONSENT_VERSION) {
    return Response.json(
      {
        success: false,
        message: 'O consentimento para receber mensagens no WhatsApp é obrigatório.',
      },
      { status: 400 }
    );
  }

  const consentAt = new Date().toISOString();

  const payload: Record<string, unknown> = {
    name,
    phone,
    landing_page_slug: 'landing_page_dossie',
    whatsapp_consent: true,
    whatsapp_consent_at: consentAt,
    whatsapp_consent_version: CONSENT_VERSION,
    whatsapp_consent_statement: WHATSAPP_CONSENT_STATEMENT,
  };
  if (email) payload.email = email;
  if (birth) payload.birth = birth;
  if (city) payload.city = city;

  try {
    const res = await fetch('https://engajabr.com.br/api/landing-page/register', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error('EngajaBR error:', err);
    return Response.json(
      { success: false, message: 'Falha de conexão com o serviço de cadastro.' },
      { status: 502 }
    );
  }
}
