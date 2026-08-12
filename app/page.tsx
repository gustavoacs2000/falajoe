'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import './falajoe.css';

type Message = { role: 'user' | 'assistant'; content: string; at?: string };

const INSTAGRAM_URL = 'https://www.instagram.com/joevalleoficial/';

const WELCOME =
  'Olá! Sou o FalaJoe, assistente virtual da campanha de Joe Valle. Estou aqui para conversar com você.\n\n' +
  'Posso ajudar a conhecer propostas, responder dúvidas e registrar sugestões para nossa cidade.';

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);

/* ---------------------------------- ícones --------------------------------- */

const strokeProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const IconShield = () => (
  <svg {...strokeProps}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9.2 12.2 1.9 1.9 3.7-3.9" />
  </svg>
);

const IconMessage = () => (
  <svg {...strokeProps}>
    <path d="M20 5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v4l4.5-4H20a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
  </svg>
);

const IconSparkles = () => (
  <svg {...strokeProps}>
    <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8 12 3.5Z" />
    <path d="M18.2 15.2 19 17.3l2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1Z" />
  </svg>
);

const IconLock = () => (
  <svg {...strokeProps}>
    <rect x="4.5" y="10" width="15" height="10" rx="2.2" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    <path d="M12 14v2.2" />
  </svg>
);

const IconInfo = () => (
  <svg {...strokeProps}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.2" />
    <path d="M12 7.8h.01" />
  </svg>
);

const IconHeart = () => (
  <svg {...strokeProps}>
    <path d="M12 19.5c-4.5-2.8-7-5.6-7-8.6A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7 2.6c0 3-2.5 5.8-7 8.6Z" />
  </svg>
);

const IconVerified = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m12 2.4 2.4 1.8 3-.2 1 2.8 2.5 1.6-.9 2.9.9 2.9-2.5 1.6-1 2.8-3-.2-2.4 1.8-2.4-1.8-3 .2-1-2.8-2.5-1.6.9-2.9-.9-2.9L5.6 6.8l1-2.8 3 .2L12 2.4Z"
      fill="currentColor"
    />
    <path
      d="m8.8 12.1 2.2 2.2 4.2-4.4"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.6 20.5 21 12 3.6 3.5l.1 6.6L15 12 3.7 13.9l-.1 6.6Z" />
  </svg>
);

const BotAvatar = () => (
  <svg className="avatar" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 15V9.5" stroke="#101b3b" strokeWidth={3} strokeLinecap="round" />
    <circle cx="32" cy="7" r="3.2" fill="#101b3b" />
    <rect x="5" y="29" width="6" height="12" rx="3" fill="#101b3b" />
    <rect x="53" y="29" width="6" height="12" rx="3" fill="#101b3b" />
    <rect x="10.5" y="15" width="43" height="38" rx="13" fill="#fff" stroke="#101b3b" strokeWidth={3} />
    <rect x="18" y="24" width="28" height="18" rx="9" fill="#101b3b" />
    <circle cx="27" cy="33" r="4" fill="#63a915" />
    <circle cx="39" cy="33" r="4" fill="#63a915" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.4" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-1.6 19.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 12 2Z" />
  </svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z" />
  </svg>
);

const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15.1L2 22l5-1.4A9.9 9.9 0 1 0 12 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 0 1 12 3.8Zm-3.3 4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.7 3 .6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.3-.5v-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4h-.6Z" />
  </svg>
);

/* --------------------------------- conteúdo -------------------------------- */

const PILLARS = [
  { icon: <IconShield />, label: 'Transparência e compromisso' },
  { icon: <IconMessage />, label: 'Diálogo com a cidadania' },
  { icon: <IconSparkles />, label: 'Atendimento com IA claro e responsável' },
  { icon: <IconLock />, label: 'Proteção de dados e privacidade' },
];

const TRUST = [
  { icon: <IconLock />, label: 'Privacidade protegida' },
  { icon: <IconShield />, label: 'Informações confiáveis' },
  { icon: <IconHeart />, label: 'Diálogo com respeito' },
];

/* -------------------------------- componente ------------------------------- */

export default function FalaJoeChat() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // O horário só é calculado depois da montagem para não divergir do HTML do servidor.
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === 0 && !msg.at ? { ...msg, at: formatTime(new Date()) } : msg)),
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text, at: formatTime(new Date()) };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    // Bolha vazia do assistente, preenchida conforme o stream chega.
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error('Erro na resposta');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // A última parte pode ser uma linha incompleta: guarda para o próximo chunk.
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (!delta) continue;
            accumulated += delta;
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: accumulated, at: formatTime(new Date()) },
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
          content: 'Desculpe, ocorreu um erro. Tente novamente.',
          at: formatTime(new Date()),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const waitingFirstToken = isLoading && messages[messages.length - 1]?.content === '';

  return (
    <div className="page">
      <main className="main">
        {/* ===================== CAMPANHA ===================== */}
        <section className="campaign" aria-label="Campanha Joe Valle">
          <div className="deco" aria-hidden="true">
            <div className="circle-a" />
            <div className="circle-b" />
            <div className="dots" />
          </div>

          <div className="photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/joe-valle.webp" alt="Joe Valle" width={1131} height={1093} />
          </div>

          <div className="campaign-inner">
            <div className="headline">
              <p className="candidate">
                <span className="cand-name">Joe Valle</span>
                <span className="cand-role">Pré-candidato a Vereador</span>
              </p>
              <h1>
                <span className="fala">Fala,</span>
                <span className="joe">Joe</span>
              </h1>
              <p className="sub">
                <span className="l1">Pergunta</span>
                <span className="l2">que eu te</span>
                <span className="l3">respondo</span>
              </p>
            </div>

            <p className="institutional">
              Um canal direto para você tirar dúvidas, fazer sugestões e acompanhar as propostas da
              nossa campanha.
            </p>

            <ul className="pillars">
              {PILLARS.map((pillar) => (
                <li key={pillar.label}>
                  {pillar.icon}
                  <span>{pillar.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===================== CHAT ===================== */}
        <div className="chat-wrap">
          <div className="chat">
            <div className="chat-top">
              <header className="chat-header">
                <div className="brand">
                  <BotAvatar />
                  <div>
                    <p className="name">
                      FalaJoe
                      <IconVerified />
                    </p>
                    <p className="role">Assistente virtual com IA</p>
                  </div>
                </div>

                <p className="ai-badge">
                  <IconSparkles />
                  <span>
                    Atendimento realizado por
                    <br />
                    <strong>inteligência artificial</strong>
                  </span>
                </p>
              </header>

              <p className="notice">
                <IconInfo />
                <span>
                  Este chatbot usa IA para responder dúvidas e orientar o cidadão de forma rápida,
                  transparente e segura.
                </span>
              </p>
            </div>

            <div
              className="messages"
              role="log"
              aria-live="polite"
              aria-label="Histórico da conversa"
            >
              {messages.map((msg, i) => {
                if (msg.role === 'assistant' && msg.content === '') return null;
                return (
                  <div key={i} className={msg.role === 'user' ? 'row user' : 'row bot'}>
                    {msg.role === 'assistant' && <BotAvatar />}
                    <div className={msg.role === 'user' ? 'bubble user' : 'bubble bot'}>
                      <span>{msg.content}</span>
                      {msg.at && <span className="time">{msg.at}</span>}
                    </div>
                  </div>
                );
              })}

              {waitingFirstToken && (
                <div className="row bot">
                  <BotAvatar />
                  <div className="bubble bot">
                    <span className="sr-only">FalaJoe está escrevendo</span>
                    <div className="typing" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="composer">
              <label className="sr-only" htmlFor="falajoe-input">
                Digite sua mensagem para o FalaJoe
              </label>
              <input
                id="falajoe-input"
                type="text"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isLoading}
                placeholder="Digite sua mensagem..."
              />
              <button
                className="send"
                aria-label="Enviar mensagem"
                disabled={isLoading || !input.trim()}
                onClick={() => sendMessage()}
              >
                <IconSend />
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-inner">
          <div className="social">
            <span>Siga nossas redes</span>
            <ul>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Joe Valle"
                  title="Instagram de Joe Valle"
                >
                  <IconInstagram />
                </a>
              </li>
              <li>
                <span
                  title="Perfil ainda não cadastrado"
                  aria-label="Facebook: perfil ainda não cadastrado"
                >
                  <IconFacebook />
                </span>
              </li>
              <li>
                <span
                  title="Perfil ainda não cadastrado"
                  aria-label="YouTube: perfil ainda não cadastrado"
                >
                  <IconYoutube />
                </span>
              </li>
              <li>
                <span
                  title="Perfil ainda não cadastrado"
                  aria-label="WhatsApp: perfil ainda não cadastrado"
                >
                  <IconWhatsapp />
                </span>
              </li>
            </ul>
          </div>

          <ul className="trust">
            {TRUST.map((item) => (
              <li key={item.label}>
                {item.icon}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="footer-text">
            <p className="tagline">Transparência. Experiência. Compromisso com nossa cidade.</p>
            <p className="copyright">© 2026 Campanha Joe Valle. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
