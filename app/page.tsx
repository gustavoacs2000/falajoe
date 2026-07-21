'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { CONSENT_VERSION, WHATSAPP_CONSENT_STATEMENT } from './lib/consent';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Olá! Sou o JoeBot, assistente virtual de campanha do Joe Valle. O que mais te preocupa no nosso cenário distrital atual para que eu possa te mostrar como podemos ajudar?',
};



const TIMELINE = [
  {
    period: '2007–2010',
    title: 'Secretário de C&T para Inclusão Social — MCT',
    desc: 'Plano Nacional de Inclusão Digital, expansão de telecentros e Centros Vocacionais Tecnológicos.',
  },
  {
    period: '2010–2014',
    title: 'Eleito Pré-candidato a Deputado Distrital — 1º mandato na CLDF',
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
  { label: 'Meio ambiente, resíduos e agroecologia', detail: '6 de 9 · 67%', pct: 67 },
  { label: 'Educação, alimentação e trabalho rural', detail: '4 de 5 · 80%', pct: 80 },
  { label: 'Transparência e participação social', detail: '2 de 5 · 40%', pct: 40 },
  { label: 'Saúde, direitos e consumidor', detail: '2 de 5 · 40%', pct: 40 },
  { label: 'Cultura e artesanato', detail: '6 de 7 · 86%', pct: 86 },
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


function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, []);

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
  const [consent, setConsent] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (!termsOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTermsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [termsOpen]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const data = new FormData(f);
    const phone = String(data.get('phone') || '').replace(/\D/g, '');
    if (phone.length < 10) {
      setError('Informe um WhatsApp válido com DDD.');
      return;
    }
    if (!consent) {
      setError('Autorize o recebimento de mensagens para concluir o cadastro.');
      return;
    }
    const payload: Record<string, string | boolean> = {
      name: String(data.get('name') || '').trim(),
      phone,
      whatsappConsent: true,
      consentVersion: CONSENT_VERSION,
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
        setConsent(false);
        f.reset();
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

  const inputClass =
    'border border-[#CDC1AA] bg-[#FBF7EE] rounded px-3.5 py-3 text-sm font-sans text-[#2B2118]';
  const labelClass = 'text-xs font-semibold text-[#5A4F42]';

  return (
    <>
      {termsOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTermsOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            aria-describedby="privacy-summary"
            className="relative max-h-full w-full max-w-[680px] overflow-y-auto rounded-2xl border border-[#D8CBB7] bg-[#FBF7EE] px-6 py-7 text-[#2B2118] shadow-2xl sm:px-9 sm:py-9"
          >
            <button
              type="button"
              onClick={() => setTermsOpen(false)}
              autoFocus
              aria-label="Fechar termos"
              className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D8CBB7] bg-transparent text-xl text-[#6E6257] transition-colors hover:bg-[#ECE3D2]"
            >
              ×
            </button>

            <div className="pr-10">
              <div className="font-mono text-[10px] tracking-[2px] text-[#8F6516]">
                VERSÃO {CONSENT_VERSION}
              </div>
              <h3 id="privacy-title" className="mt-2 font-serif text-2xl font-bold">
                Termos de consentimento e aviso de privacidade
              </h3>
            </div>

            <p id="privacy-summary" className="mt-5 text-sm leading-6 text-[#5F5347]">
              Este aviso explica como os dados enviados neste formulário serão usados pela equipe
              de pré-campanha de Joe Valle para manter contato com você.
            </p>

            <div className="mt-6 space-y-5 text-sm leading-6 text-[#5F5347]">
              <section>
                <h4 className="font-bold text-[#2B2118]">1. Responsável e dados tratados</h4>
                <p className="mt-1">
                  A equipe de pré-campanha de Joe Valle é responsável pelo tratamento. Serão
                  tratados nome, número de telefone e, quando informados, e-mail e cidade/região,
                  além da data, origem e versão deste consentimento.
                </p>
              </section>

              <section className="rounded-lg border border-[#D6B56F] bg-[#F5EBD2] px-4 py-3">
                <h4 className="font-bold text-[#2B2118]">2. Dado pessoal sensível</h4>
                <p className="mt-1">
                  A adesão a uma rede de campanha pode revelar ou permitir inferir opinião
                  política. Por isso, o uso desse dado fica limitado às finalidades descritas aqui
                  e depende do seu consentimento específico e destacado.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2B2118]">3. Finalidades</h4>
                <p className="mt-1">
                  Os dados poderão ser usados para enviar mensagens pelo WhatsApp sobre a campanha,
                  propostas, eventos, pesquisas, mobilização e formas de participação, bem como para
                  organizar e responder aos contatos da rede.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2B2118]">4. Escolha e cancelamento</h4>
                <p className="mt-1">
                  O consentimento é opcional. Sem ele, o cadastro para receber essas comunicações não
                  será concluído, mas o restante do site continuará disponível. Você pode revogar a
                  autorização gratuitamente a qualquer momento respondendo <strong>SAIR</strong> a
                  uma mensagem ou solicitando pelos canais oficiais da campanha.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2B2118]">5. Compartilhamento, segurança e prazo</h4>
                <p className="mt-1">
                  Os dados não serão vendidos. Eles poderão ser tratados por fornecedores
                  indispensáveis de cadastro, hospedagem e comunicação, como o EngajaBR, sob
                  instruções da campanha, ou compartilhados quando houver obrigação legal. Serão
                  mantidos enquanto o consentimento estiver ativo e, depois, apenas pelo período
                  necessário ao cumprimento de obrigações legais, à prestação de contas e ao
                  exercício regular de direitos, com medidas razoáveis de segurança.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2B2118]">6. Seus direitos</h4>
                <p className="mt-1">
                  Você pode pedir confirmação e acesso aos dados, correção, informação sobre
                  compartilhamentos, revogação do consentimento, bloqueio ou eliminação quando
                  aplicável. O pedido pode ser feito respondendo a uma mensagem recebida ou pelos
                  canais oficiais da campanha.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2B2118]">7. Uso do WhatsApp</h4>
                <p className="mt-1">
                  O envio respeitará as escolhas registradas e os pedidos de descadastro. Este aceite
                  não autoriza mensagens para finalidades diferentes nem afasta as regras do
                  WhatsApp e a legislação aplicável.
                </p>
              </section>
            </div>

            <button
              type="button"
              onClick={() => setTermsOpen(false)}
              className="mt-7 w-full cursor-pointer rounded-lg border-none bg-[#B9862C] px-6 py-3.5 text-sm font-bold text-[#211711] transition-colors hover:bg-[#C9962F]"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div 
            className="bg-[#241A12] rounded-2xl px-8 py-10 max-w-[420px] w-full text-center relative border border-[rgba(185,134,44,.3)]"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              animation: 'chatpop .3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div className="w-16 h-16 bg-[#B9862C] rounded-full flex items-center justify-center mx-auto mb-6"
                 style={{ boxShadow: '0 0 20px rgba(185,134,44,.4)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#211711" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#F3ECDD] mb-4">
              Obrigado por se juntar ao time Joe Valle!
            </h3>
            <p className="text-[15px] text-[#BDB2A2] mb-8 leading-relaxed">
              Seu cadastro foi realizado com sucesso. Juntos, vamos construir um futuro melhor para o Distrito Federal.
            </p>
            <button
              onClick={() => setDone(false)}
              className="bg-[#B9862C] text-[#211711] font-bold text-[14px] tracking-[.5px] px-8 py-3.5 rounded-lg w-full hover:bg-[#C9962F] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              FECHAR E CONTINUAR
            </button>
          </div>
        </div>
      )}
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
        {/* <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Data de nascimento</label>
          <input name="birth" type="date" className={inputClass} />
        </div> */}
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
        <div className="sm:col-span-2 rounded-lg border border-[#D8CBB7] bg-[#F8F2E7] px-4 py-4">
          <div className="flex items-start gap-3">
            <input
              id="whatsapp-consent"
              name="whatsappConsent"
              type="checkbox"
              required
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                if (event.target.checked) setError('');
              }}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#B9862C]"
            />
            <div className="text-xs leading-[1.65] text-[#5A4F42]">
              <label htmlFor="whatsapp-consent" className="cursor-pointer">
                {WHATSAPP_CONSENT_STATEMENT}
              </label>
              <div>
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="cursor-pointer border-none bg-transparent p-0 font-bold text-[#8F6516] underline decoration-[#B9862C]/60 underline-offset-2 hover:text-[#6F4D0C]"
                >
                  Consultar os Termos e o Aviso de Privacidade
                </button>
              </div>
            </div>
          </div>
          <p className="mb-0 ml-[30px] mt-2 text-[11px] leading-4 text-[#8B7F70]">
            Campo obrigatório. A caixa começa desmarcada e você pode retirar o consentimento quando
            quiser.
          </p>
        </div>
        <div className="sm:col-span-2 flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            disabled={sending}
            className="bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-7 py-3.5 rounded border-none cursor-pointer font-sans hover:bg-[#C9962F] disabled:opacity-60 transition-colors"
          >
            {sending ? 'ENVIANDO…' : 'QUERO PARTICIPAR'}
          </button>
          {error && (
            <span role="alert" aria-live="polite" className="text-[13px] text-[#A3542F]">
              {error}
            </span>
          )}
        </div>
      </form>
    </>
  );
}

export default function LandingDossieJoeValle() {
  const [menuOpen, setMenuOpen] = useState(false);



  return (
    <div className="font-sans text-[#2B2118] w-full">
      {/* Header mobile */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#211711] px-5 py-3.5 flex items-center justify-between">
        <div>
          <div className="font-serif text-lg font-bold tracking-[.5px] text-[#F3ECDD]">
            JOE VALLE
          </div>
          <div className="font-mono text-[9px] tracking-[2.5px] text-[#B9862C]">Pré-candidato a Deputado Distrital</div>
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

            <a
              href="#cadastro"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block text-center bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-4 py-3 rounded"
            >
              FAÇA PARTE DA NOSSA REDE
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
            Pré-candidato a Deputado Distrital
          </div>
        </div>
        <div className="h-px bg-[rgba(239,231,216,.14)] my-[26px]" />
        <div className="flex flex-col items-center gap-2.5 mt-[30px]">
          <Image
            src="/joe-valle.jpg"
            alt="Joe Valle"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border-2 border-[rgba(185,134,44,.5)]"
          />
          <div className="text-xs leading-normal text-[#BDB2A2] text-center">
            Engenheiro florestal
            <br />
            Fazenda Malunga
          </div>
        </div>
        <a
          href="#cadastro"
          className="mt-[26px] block text-center bg-[#B9862C] text-[#211711] font-bold text-[13px] tracking-[.5px] px-4 py-[13px] rounded hover:bg-[#C9962F] transition-colors"
        >
          FAÇA PARTE DA NOSSA REDE
        </a>
        <button
          onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-transparent text-[#B9862C] font-bold text-[13px] tracking-[.5px] px-4 py-[13px] rounded border border-[#B9862C] hover:bg-[rgba(185,134,44,.12)] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          FALE COM O JOEBOT
        </button>
        <div className="mt-auto flex items-baseline justify-between">
          <span className="font-serif text-[30px] font-bold text-[#F3ECDD]">12</span>
          <span className="font-mono text-[10px] tracking-[2px] text-[#7E7263]">PDT</span>
        </div>
      </aside>

      <main className="lg:ml-[264px]">
        {/* Cadastro — foto à esquerda, formulário à direita */}
        <section id="cadastro" className="px-5 sm:px-10 lg:px-[72px] pt-14 lg:pt-[72px] pb-16 max-w-[1120px]">
          {/* <div className="font-mono text-[11px] tracking-[3px] text-[#8F6516]">
            Pré-candidato a Deputado Distrital — CICLO 2026
          </div> */}
          {/* <h1
            className="font-serif text-4xl sm:text-5xl lg:text-[52px] leading-[1.12] font-bold text-[#2B2118] mt-5 mb-9 max-w-[640px]"
            style={{ textWrap: 'pretty' }}
          >
            As propostas aqui já foram testadas — em lei.
          </h1> */}

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
                CADASTRO
              </div>
              <h2 className="font-serif text-2xl font-bold mt-3 mb-2">Faça parte da nossa rede. Vamos construir nosso futuro juntos!</h2>
              <p className="text-sm text-[#6E6257] m-0 mb-6 leading-[1.7]">
                Convido você a fazer parte da nossa rede e do nosso projeto coletivo. Aqui, cada ideia conta, cada voz é importante. Juntos, podemos construir um Distrito Federal mais humano, sustentável e cheio de oportunidades.
              </p>
              <RegisterForm />
              <p className="text-[11px] text-[#A0937F] mt-[18px] mb-0">
                Seus dados serão tratados apenas para as finalidades informadas no consentimento,
                conforme a LGPD.
              </p>
            </div>
          </div>
        </section>

        {/* Trajetória
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
        </section> */}

        {/* Painel legislativo
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
        </section> */}

        {/* Marcos em lei
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

          {/* <div className="mt-12 bg-[#241A12] rounded-lg px-6 sm:px-[38px] py-[34px] flex items-center justify-between gap-7 max-w-[760px] flex-wrap">
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
        </section> */}

        <footer className="bg-[#211711] text-[#9A8C77] px-5 sm:px-10 lg:px-[72px] py-[26px] flex justify-between items-center text-xs flex-wrap gap-3">
          <span>Joe Valle · PDT 12 · Distrito Federal</span>
          <span className="font-mono text-[11px] tracking-[1.5px]">Pré-candidato a Deputado Distrital 2026</span>
        </footer>
      </main>

      <ChatWidget />
    </div>
  );
}
