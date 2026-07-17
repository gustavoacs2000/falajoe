export const maxDuration = 15;

// Proxy para o cadastro do EngajaBR — mantém a API key no servidor.
// Variáveis de ambiente:
//   ENGAJABR_API_KEY        (obrigatória)
//   ENGAJABR_CITY_FIELD_ID  (opcional — id do campo customizado de cidade)
export async function POST(req: Request) {
  const apiKey = process.env.ENGAJABR_API_KEY;
  if (!apiKey) {
    return Response.json(
      { success: false, message: 'Cadastro indisponível no momento. Tente novamente mais tarde.' },
      { status: 503 }
    );
  }

  const { name, phone, email, birth, city } = await req.json();

  if (!name || !phone) {
    return Response.json(
      { success: false, message: 'Nome e WhatsApp são obrigatórios.' },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    name,
    phone,
    landing_page_slug: 'landing_page_dossie',
  };
  if (email) payload.email = email;
  if (birth) payload.birth = birth;

  const cityFieldId = process.env.ENGAJABR_CITY_FIELD_ID;
  if (city && cityFieldId) {
    payload.custom_fields = { [cityFieldId]: city };
  }

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
