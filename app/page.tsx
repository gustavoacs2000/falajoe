'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useRef, useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Olá! Sou o JoeBot, assistente virtual de campanha do Joe Valle. O que mais te preocupa no nosso cenário distrital atual para que eu possa te mostrar como podemos ajudar?',
};

const SECTIONS = [
  { id: 'cadastro', label: 'Cadastro' },
  { id: 'trajetoria', label: 'Trajetória' },
  { id: 'painel', label: 'Painel legislativo' },
  { id: 'marcos', label: 'Marcos em lei' },
];

const TIMELINE = [
  {
    period: '2007–2010',
    title: 'Secretário de C&T para Inclusão Social — MCT',
    desc: 'Plano Nacional de Inclusão Digital, expansão de telecentros e Centros Vocacionais Tecnológicos.',
  },
  {
    period: '2010–2014',
    title: 'Eleito deputado distrital — 1º mandato na CLDF',
    desc: 'Leis do clima, agricultura urbana, dados educacionais, alimentação saudável e resíduos sólidos.',
  },
  {
    period: '2015–2016',
    title: 'Secretário do Trabalho e Desenvolvimento Social — GDF',
    desc: 'Portal de capacitação com 21 cursos gratuitos, Agência do Trabalhador para PcD, Centro de Referência em Agroecologia.',
  },
  {
    period: '2017–2018',
    title: 'Presidente da Câmara Legislativa do DF',
    desc: '2º mandato: Estatuto do Artesão, transparência no SUS-DF e participação social.',
  },
  {
    period: '2026',
    title: 'De volta, pelo PDT',
    desc: 'A campanha começa pelo histórico: o que já virou lei fala primeiro.',
  },
];

const THEMES = [
  { label: 'Meio ambiente, resíduos & agroecologia', detail: '6 de 9 · 67%', pct: 67 },
  { label: 'Educação, alimentação & trabalho rural', detail: '4 de 5 · 80%', pct: 80 },
  { label: 'Transparência & participação social', detail: '2 de 5 · 40%', pct: 40 },
  { label: 'Saúde, direitos & consumidor', detail: '2 de 5 · 40%', pct: 40 },
  { label: 'Cultura, artesanato & homenagens', detail: '6 de 7 · 86%', pct: 86 },
];

const LAWS: Array<{ num: string; text: string; note?: string }> = [
  { num: 'Lei 4.797/12', text: 'Política de Mudança Climática do Distrito Federal' },
  { num: 'Lei 5.418/14', text: 'Política Distrital de Resíduos Sólidos' },
  { num: 'Lei 5.610/16', text: 'Responsabilidade dos grandes geradores de resíduos' },
  { num: 'Lei 4.772/12', text: 'Agricultura urbana e periurbana no DF', note: '(coautoria)' },
  { num: 'Lei 5.146/13', text: 'Alimentação saudável nas escolas da rede pública' },
  { num: 'Lei 4.850/12', text: 'Divulgação de dados e indicadores educacionais em tempo real' },
  { num: 'Lei 6.149/18', text: 'Transparência no atendimento das unidades do SUS-DF', note: '(veto derrubado)' },
  { num: 'Lei 6.092/18', text: 'Estatuto do Artesão no Distrito Federal' },
  { num: 'Lei 5.739/16', text: 'Programa de Formação de Mão de Obra Rural' },
  { num: 'Lei 5.271/13', text: 'Coleta seletiva de resíduos de oficinas e indústrias químicas' },
  { num: 'Lei 5.903/17', text: 'Bebedouros com água filtrada em estabelecimentos' },
  { num: 'Lei 6.197/18', text: 'Atualização da Política Distrital do Idoso' },
];

const STATS = [
  { value: '2', label: 'mandatos CLDF' },
  { value: '1', label: 'presidência da Casa' },
  { value: '~20', label: 'leis sancionadas' },
  { value: '65%', label: 'taxa de aprovação' },
];

// Regiões Administrativas do DF + opções para quem mora fora
const DF_CITIES = [
  'Água Quente',
  'Águas Claras',
  'Arapoanga',
  'Arniqueira',
  'Brazlândia',
  'Candangolândia',
  'Ceilândia',
  'Cruzeiro',
  'Fercal',
  'Gama',
  'Guará',
  'Itapoã',
  'Jardim Botânico',
  'Lago Norte',
  'Lago Sul',
  'Núcleo Bandeirante',
  'Paranoá',
  'Park Way',
  'Planaltina',
  'Plano Piloto (Brasília)',
  'Recanto das Emas',
  'Riacho Fundo',
  'Riacho Fundo II',
  'Samambaia',
  'Santa Maria',
  'São Sebastião',
  'SCIA/Estrutural',
  'SIA',
  'Sobradinho',
  'Sobradinho II',
  'Sol Nascente/Pôr do Sol',
  'Sudoeste/Octogonal',
  'Taguatinga',
  'Varjão',
  'Vicente Pires',
  'Entorno do DF (GO)',
  'Outra',
];

function NavLinks({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {SECTIONS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={onNavigate}
          className="flex gap-3 items-baseline px-3 py-[9px] rounded text-sm font-medium transition-colors"
          style={{
            color: active === s.id ? '#F3ECDD' : '#BDB2A2',
            background: active === s.id ? 'rgba(185,134,44,.14)' : 'transparent',
          }}
        >
          <span className="font-mono text-[10px] text-[#B9862C]">
            {String(i + 1).padStart(2, '0')}
          </span>
          {s.label}
        </a>
      ))}
    </nav>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isLoading, open]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    // Adiciona bolha vazia do assistente para preencher com stream
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error('Erro na resposta');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            accumulated += delta;
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: accumulated },
            ]);
          } catch {
            // linha mal-formada, ignora
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content:
            'Não consegui responder agora. Tente de novo em instantes — ou deixe seu contato no formulário que a equipe responde.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const typing = isLoading && messages[messages.length - 1]?.content === '';

  return (
    <>
      {open && (
        <div
          className="fixed right-4 sm:right-6 bottom-[100px] w-[calc(100vw-32px)] max-w-[360px] h-[520px] max-h-[calc(100vh-130px)] bg-[#F1EADB] rounded-[14px] flex flex-col overflow-hidden z-40"
          style={{
            boxShadow: '0 18px 48px rgba(33,23,17,.35)',
            animation: 'chatpop .22s ease-out',
          }}
        >
          <div className="bg-[#241A12] px-4 py-3.5 flex items-center gap-3">
            <Image
              src="/joe-valle.jpg"
              alt="JoeBot"
              width={38}
              height={38}
              className="w-[38px] h-[38px] rounded-full object-cover border border-[rgba(185,134,44,.6)]"
            />
            <div className="flex-1">
              <div className="text-[#F3ECDD] font-bold text-sm">JoeBot</div>
              <div className="text-[#8FBF7F] text-[11px]">online — pergunte sobre o Joe</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="bg-transparent border-none text-[#9A8C77] text-xl cursor-pointer leading-none p-1"
            >
              ×
            </button>
          </div>

          <div
            ref={logRef}
            className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-2.5"
            style={{
              background:
                'linear-gradient(rgba(241,234,219,.94),rgba(241,234,219,.94)),repeating-linear-gradient(45deg,#E5DBC8 0,#E5DBC8 1px,transparent 1px,transparent 12px)',
            }}
          >
            {messages.map((msg, i) =>
              typing && i === messages.length - 1 ? null : (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[78%] px-[13px] py-[9px] text-[#2B2118] text-[13.5px] leading-[1.55] whitespace-pre-wrap"
                    style={{
                      background: msg.role === 'user' ? '#E2CE9E' : '#FBF7EE',
                      borderRadius:
                        msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                      boxShadow: '0 1px 2px rgba(33,23,17,.12)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )}

            {typing && (
              <div className="flex">
                <div
                  className="px-3.5 py-[11px] bg-[#FBF7EE] flex gap-[5px]"
                  style={{
                    borderRadius: '10px 10px 10px 2px',
                    boxShadow: '0 1px 2px rgba(33,23,17,.12)',
                  }}
                >
                  {[0, 0.2, 0.4].map((delay) => (
                    <span
                      key={delay}
                      className="w-[7px] h-[7px] rounded-full bg-[#B9862C]"
                      style={{ animation: `blink 1.2s infinite ${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-2.5 p-3 bg-[#ECE3D2] border-t border-[#E0D6C4]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua pergunta…"
              className="flex-1 border border-[#CDC1AA] bg-[#FBF7EE] rounded-[20px] px-4 py-[11px] text-[13.5px] font-sans text-[#2B2118] outline-none min-w-0"
            />
            <button
              type="submit"
              aria-label="Enviar"
              disabled={isLoading || !input.trim()}
              className="w-[42px] h-[42px] rounded-full bg-[#B9862C] border-none cursor-pointer text-[#211711] text-[17px] flex items-center justify-center shrink-0 hover:bg-[#C9962F] disabled:opacity-40 transition-colors"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat"
        className="fixed right-4 sm:right-6 bottom-6 w-[60px] h-[60px] rounded-full bg-[#B9862C] border-none cursor-pointer flex items-center justify-center z-[41] hover:bg-[#C9962F] transition-colors"
        style={{ boxShadow: '0 10px 26px rgba(33,23,17,.35)' }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#211711"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </>
  );
}

function RegisterForm() {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const data = new FormData(f);
    const phone = String(data.get('phone') || '').replace(/\D/g, '');
    if (phone.length < 10) {
      setError('Informe um WhatsApp válido com DDD.');
      return;
    }
    const payload: Record<string, string> = {
      name: String(data.get('name') || '').trim(),
      phone,
    };
    const email = String(data.get('email') || '').trim();
    const birth = String(data.get('birth') || '');
    const city = String(data.get('city') || '').trim();
    if (email) payload.email = email;
    if (birth) payload.birth = birth;
    if (city) payload.city = city;

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success) {
        setDone(true);
      } else {
        const errs = result.errors
          ? Object.values(result.errors).flat().join(' ')
          : result.message || 'Não foi possível concluir o cadastro.';
        setError(String(errs));
      }
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="bg-[#241A12] rounded-lg px-8 py-[30px] max-w-[560px]">
        <div className="font-serif text-xl font-bold text-[#F3ECDD]">Cadastro confirmado ✓</div>
        <p className="text-sm text-[#BDB2A2] mt-2.5 leading-relaxed">
          Obrigado! Em breve você recebe o dossiê completo no seu WhatsApp.
        </p>
      </div>
    );
  }

  const inputClass =
    'border border-[#CDC1AA] bg-[#FBF7EE] rounded px-3.5 py-3 text-sm font-sans text-[#2B2118]';
  const labelClass = 'text-xs font-semibold text-[#5A4F42]';

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px]">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Nome *</label>
        <input name="name" required placeholder="Seu nome completo" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>WhatsApp *</label>
        <input
          name="phone"
          required
          placeholder="(61) 99999-9999"
          inputMode="tel"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>E-mail</label>
        <input name="email" type="email" placeholder="voce@exemplo.com" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Data de nascimento</label>
        <input name="birth" type="date" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className={labelClass}>Cidade / Região Administrativa</label>
        <select name="city" defaultValue="" className={`${inputClass} cursor-pointer`}>
          <option value="">Selecione sua cidade…</option>
          {DF_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 flex items-center gap-4 flex-wrap">
        <button
          type="submit"
          disabled={sending}
          className="bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-7 py-3.5 rounded border-none cursor-pointer font-sans hover:bg-[#C9962F] disabled:opacity-60 transition-colors"
        >
          {sending ? 'ENVIANDO…' : 'QUERO RECEBER'}
        </button>
        {error && <span className="text-[13px] text-[#A3542F]">{error}</span>}
      </div>
    </form>
  );
}

export default function LandingDossieJoeValle() {
  const [active, setActive] = useState('cadastro');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      let cur = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="font-sans text-[#2B2118] w-full">
      {/* Header mobile */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#211711] px-5 py-3.5 flex items-center justify-between">
        <div>
          <div className="font-serif text-lg font-bold tracking-[.5px] text-[#F3ECDD]">
            JOE VALLE
          </div>
          <div className="font-mono text-[9px] tracking-[2.5px] text-[#B9862C]">DOSSIÊ 2026</div>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          className="text-[#F3ECDD] bg-transparent border border-[rgba(239,231,216,.25)] rounded px-3 py-2 text-sm"
        >
          ☰
        </button>
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#211711] px-5 pb-5 pt-1 border-t border-[rgba(239,231,216,.14)]">
            <NavLinks active={active} onNavigate={() => setMenuOpen(false)} />
            <a
              href="#cadastro"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block text-center bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-4 py-3 rounded"
            >
              QUERO O DOSSIÊ COMPLETO
            </a>
          </div>
        )}
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[264px] bg-[#211711] text-[#EFE7D8] flex-col pt-9 px-6 pb-7 z-20">
        <div>
          <div className="font-serif text-[26px] font-bold tracking-[.5px] text-[#F3ECDD]">
            JOE VALLE
          </div>
          <div className="font-mono text-[11px] tracking-[2.5px] text-[#B9862C] mt-1">
            DOSSIÊ 2026
          </div>
        </div>
        <div className="h-px bg-[rgba(239,231,216,.14)] my-[26px]" />
        <NavLinks active={active} />
        <div className="flex items-center gap-3 mt-[30px]">
          <Image
            src="/joe-valle.jpg"
            alt="Joe Valle"
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover border border-[rgba(185,134,44,.5)]"
          />
          <div className="text-xs leading-normal text-[#BDB2A2]">
            Engenheiro florestal
            <br />
            Fazenda Malunga
          </div>
        </div>
        <a
          href="#cadastro"
          className="mt-[26px] block text-center bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-4 py-[13px] rounded hover:bg-[#C9962F] transition-colors"
        >
          QUERO O DOSSIÊ COMPLETO
        </a>
        <div className="mt-auto flex items-baseline justify-between">
          <span className="font-serif text-[30px] font-bold text-[#F3ECDD]">12</span>
          <span className="font-mono text-[10px] tracking-[2px] text-[#7E7263]">PDT</span>
        </div>
      </aside>

      <main className="lg:ml-[264px]">
        {/* Cadastro — foto à esquerda, formulário à direita */}
        <section id="cadastro" className="px-5 sm:px-10 lg:px-[72px] pt-14 lg:pt-[72px] pb-16 max-w-[1120px]">
          <div className="font-mono text-[11px] tracking-[3px] text-[#8F6516]">
            DOSSIÊ ELEITORAL — CICLO 2026
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-[52px] leading-[1.12] font-bold text-[#2B2118] mt-5 mb-9 max-w-[640px]"
            style={{ textWrap: 'pretty' }}
          >
            As propostas aqui já foram testadas — em lei.
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_400px] lg:grid-cols-[minmax(0,1fr)_460px] gap-x-10 lg:gap-x-14 gap-y-8 items-start">
            {/* Arte da campanha — reduzida e centralizada no mobile, coluna esquerda no desktop */}
            <div>
              <Image
                src="/time-do-joe.jpg"
                alt="Faça parte do Time do Joe — arte da campanha com apoiadores no cerrado"
                width={1080}
                height={1350}
                preload
                sizes="(max-width: 768px) 240px, 460px"
                className="w-full max-w-[240px] md:max-w-[460px] h-auto mx-auto md:mx-0 rounded-lg border border-[#E0D6C4]"
                style={{ boxShadow: '0 14px 34px rgba(33,23,17,.18)' }}
              />
            </div>

            {/* Formulário de cadastro — sempre visível; fixo na rolagem no desktop */}
            <div className="lg:sticky lg:top-8 bg-[#ECE3D2] border border-[#E0D6C4] rounded-lg px-6 py-7 sm:px-8 sm:py-8">
              <div className="font-mono text-[11px] tracking-[3px] text-[#8F6516]">
                CADASTRO — LANDING PAGE DOSSIÊ
              </div>
              <h2 className="font-serif text-2xl font-bold mt-3 mb-2">Receba o dossiê completo</h2>
              <p className="text-sm text-[#6E6257] m-0 mb-6 leading-[1.7]">
                Deixe seus dados e receba o histórico completo, com número de lei e link para a
                fonte oficial. Sem spam.
              </p>
              <RegisterForm />
              <p className="text-[11px] text-[#A0937F] mt-[18px] mb-0">
                Seus dados são usados exclusivamente pela campanha, conforme a LGPD.
              </p>
            </div>
          </div>
        </section>

        {/* Trajetória */}
        <section id="trajetoria" className="px-5 sm:px-10 lg:px-[72px] py-16 max-w-[960px]">
          <h2 className="font-serif text-2xl font-bold m-0 mb-1.5">Trajetória pública</h2>
          <p className="text-[13px] text-[#8B7F70] m-0 mb-5">
            Do governo federal à presidência da Câmara Legislativa do DF.
          </p>
          <p className="text-[15px] leading-[1.7] text-[#6E6257] m-0 max-w-[560px]">
            Dois mandatos na Câmara Legislativa, uma presidência da Casa (2017–2018) e cerca de 20
            políticas públicas sancionadas. Antes de pedir o voto de novo, o histórico está aqui —
            com número de lei e tudo.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-7 mt-9 mb-12 max-w-[820px]">
            {STATS.map((s) => (
              <div key={s.label} className="border-l-[3px] border-[#B9862C] pl-4">
                <div className="font-serif text-[30px] font-bold">{s.value}</div>
                <div className="text-xs text-[#6E6257] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col max-w-[720px]">
            {TIMELINE.map((t, i) => (
              <div
                key={t.period}
                className={`grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6 py-[18px] border-t border-[#E0D6C4] ${
                  i === TIMELINE.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="font-mono text-[13px] text-[#8F6516]">{t.period}</div>
                <div>
                  <strong className="text-[15px]">{t.title}</strong>
                  <div className="text-[13px] text-[#6E6257] mt-1 leading-[1.6]">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Painel legislativo */}
        <section id="painel" className="px-5 sm:px-10 lg:px-[72px] py-16 max-w-[960px]">
          <h2 className="font-serif text-2xl font-bold m-0 mb-1.5">Painel por tema</h2>
          <p className="text-[13px] text-[#8B7F70] m-0 mb-[30px]">
            Proposições de autoria, por eixo temático — taxa de conversão em lei ou implantação
            documentada.
          </p>
          <div className="flex flex-col gap-[22px] max-w-[720px]">
            {THEMES.map((t) => (
              <div key={t.label}>
                <div className="flex justify-between items-baseline mb-2 gap-3 flex-wrap">
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="font-mono text-xs text-[#8F6516]">{t.detail}</span>
                </div>
                <div className="h-2 bg-[#E5DBC8] rounded">
                  <div
                    className="h-2 bg-[#B9862C] rounded"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#A0937F] mt-[26px] max-w-[640px] leading-[1.6]">
            Fonte: catálogo consolidado a partir de fontes primárias oficiais — páginas de
            proposição da CLDF, SINJ-DF, Diário da Câmara Legislativa e Agência Brasília.
          </p>
        </section>

        {/* Marcos em lei */}
        <section id="marcos" className="px-5 sm:px-10 lg:px-[72px] pt-16 pb-[72px] max-w-[960px]">
          <h2 className="font-serif text-2xl font-bold m-0 mb-1.5">Marcos em lei</h2>
          <p className="text-[13px] text-[#8B7F70] m-0 mb-[26px]">
            Normas de autoria ou coautoria confirmadas em fonte oficial (SINJ-DF).
          </p>
          <div className="flex flex-col max-w-[760px]">
            {LAWS.map((law, i) => (
              <div
                key={law.num}
                className={`grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-1 sm:gap-5 py-[13px] border-t border-[#E0D6C4] items-baseline ${
                  i === LAWS.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="font-mono text-[13px] text-[#8F6516]">{law.num}</span>
                <span className="text-sm">
                  {law.text}{' '}
                  {law.note && <span className="text-xs text-[#A0937F]">{law.note}</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#241A12] rounded-lg px-6 sm:px-[38px] py-[34px] flex items-center justify-between gap-7 max-w-[760px] flex-wrap">
            <div>
              <div className="font-serif text-[21px] font-bold text-[#F3ECDD]">
                Quer o histórico completo, com fontes?
              </div>
              <div className="font-mono text-[11px] tracking-[1.5px] text-[#9A8C77] mt-2">
                CLDF · SINJ-DF · AGÊNCIA BRASÍLIA
              </div>
            </div>
            <a
              href="#cadastro"
              className="bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-6 py-3.5 rounded whitespace-nowrap hover:bg-[#C9962F] transition-colors"
            >
              Receber o dossiê
            </a>
          </div>
        </section>

        <footer className="bg-[#211711] text-[#9A8C77] px-5 sm:px-10 lg:px-[72px] py-[26px] flex justify-between items-center text-xs flex-wrap gap-3">
          <span>Joe Valle · PDT 12 · Distrito Federal</span>
          <span className="font-mono text-[11px] tracking-[1.5px]">DOSSIÊ ELEITORAL 2026</span>
        </footer>
      </main>

      <ChatWidget />
    </div>
  );
}
