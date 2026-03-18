import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble, Message } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useRag } from '../store/RagContext';
import { useCrm, Lead } from '../store/CrmContext';
import { useAgenda, CalendarEvent } from '../store/AgendaContext';
import { User, UserCheck, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// ── Modal de início de simulação ──────────────────────────────────────────────
interface StartModalProps {
  onSelectNew: () => void;
  onSelectKnown: (name: string) => void;
  onClose: () => void;
}

const StartModal: React.FC<StartModalProps> = ({ onSelectNew, onSelectKnown, onClose }) => {
  const [step, setStep] = useState<'choose' | 'name'>('choose');
  const [name, setName] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '18px', padding: '28px 24px',
        width: '320px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        position: 'relative', animation: 'fadeInUp 0.25s ease',
      }}>
        {/* Fechar */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#9ca3af',
        }}>
          <X size={18} />
        </button>

        {step === 'choose' ? (
          <>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '6px', textAlign: 'center' }}>
              Iniciar Simulação
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px', lineHeight: 1.5 }}>
              Como deseja simular o atendimento?
            </p>

            {/* Novo cliente */}
            <button onClick={onSelectNew} style={{
              width: '100%', padding: '14px 16px', marginBottom: '10px',
              background: 'linear-gradient(135deg, #008069, #25d366)',
              color: '#fff', border: 'none', borderRadius: '12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              fontSize: '14px', fontWeight: 600, transition: 'opacity 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <User size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div>Novo Cliente</div>
                <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.85 }}>
                  Simula o primeiro contato
                </div>
              </div>
            </button>

            {/* Cliente conhecido */}
            <button onClick={() => setStep('name')} style={{
              width: '100%', padding: '14px 16px',
              background: '#f3f4f6', color: '#111827',
              border: '1px solid #e5e7eb', borderRadius: '12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              fontSize: '14px', fontWeight: 600, transition: 'background 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.background = '#e9ecef')}
              onMouseOut={e => (e.currentTarget.style.background = '#f3f4f6')}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#d1fae5', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <UserCheck size={18} color="#008069" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div>Cliente Conhecido</div>
                <div style={{ fontSize: '11px', fontWeight: 400, color: '#6b7280' }}>
                  Simula retorno de cliente
                </div>
              </div>
            </button>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '6px', textAlign: 'center' }}>
              Qual é o seu nome?
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '18px' }}>
              O assistente vai reconhecer você como cliente.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Maria Silva"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && onSelectKnown(name.trim())}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid #d1d5db', borderRadius: '10px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                marginBottom: '12px', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#008069')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep('choose')} style={{
                flex: 1, padding: '11px', background: '#f3f4f6',
                border: '1px solid #e5e7eb', borderRadius: '10px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#6b7280',
              }}>
                Voltar
              </button>
              <button
                onClick={() => name.trim() && onSelectKnown(name.trim())}
                disabled={!name.trim()}
                style={{
                  flex: 2, padding: '11px',
                  background: name.trim() ? 'linear-gradient(135deg, #008069, #25d366)' : '#e5e7eb',
                  color: name.trim() ? '#fff' : '#9ca3af',
                  border: 'none', borderRadius: '10px',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
                }}
              >
                Iniciar Simulação
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── Componente principal de Chat ───────────────────────────────────────────────
export const Chat: React.FC = () => {
  const { findResponse } = useRag();
  const { addLead, leads } = useCrm();
  const { events, addEvent } = useAgenda();

  const [simStarted, setSimStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState<string | null>(null);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Inicia a conversa com uma mensagem de boas-vindas
  const startConversation = (name: string | null) => {
    const greeting: Message = {
      id: uuidv4(),
      text: name
        ? `Olá, ${name}! 🌟 Que bom ter você de volta à KAVI Art Clinic. Sou a Roberta. Como posso te ajudar hoje?`
        : 'Olá! Seja muito bem-vindo à KAVI Art Clinic. ✨ Sou a Roberta. Com quem tenho o prazer de falar?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      status: 'read',
    };
    setMessages([greeting]);
    setSimStarted(true);
    setShowModal(false);
  };

  const handleSelectNew = () => {
    setClientName(null);
    startConversation(null);
  };

  const handleSelectKnown = (name: string) => {
    setClientName(name);
    // Adiciona o cliente ao CRM se não existir
    const exists = leads.find((l: Lead) => l.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      addLead({ name, phone: '912345678', status: 'new', lastMessage: '', treatments: ['Simulação'] });
    }
    startConversation(name);
  };

  // Se o usuário tentar interagir antes de iniciar, abre o modal
  const handleInputAttempt = () => {
    if (!simStarted) setShowModal(true);
  };

  // ── Lógica de resposta do bot ──
  const extractInfo = (text: string) => {
    const nameRegex = /(?:meu nome é|me chamo|aqui é o|aqui é a|sou o|sou a)\s+([A-ZÀ-Úa-zà-ú]+(?:\s+[A-ZÀ-Úa-zà-ú]+)*)/i;
    const nameMatch = text.match(nameRegex);
    return { name: nameMatch ? nameMatch[1] : null };
  };

  const checkAvailabilityForDay = (date: Date) => {
    const slots = [9, 10, 11, 14, 15, 16, 17, 18];
    return slots.filter(hour => {
      const start = new Date(date); start.setHours(hour, 0, 0, 0);
      const end = new Date(date);   end.setHours(hour + 1, 0, 0, 0);
      return !events.some((ev: CalendarEvent) => start < new Date(ev.end) && end > new Date(ev.start));
    }).map(h => `${h}:00`);
  };

  const handleSendMessage = (text: string) => {
    if (!simStarted) { setShowModal(true); return; }

    const { name } = extractInfo(text);
    const userPhone = '912345678';

    // Adiciona ao CRM se for novo e não tiver nome ainda
    if (!currentLeadId && !clientName) {
      const existingLead = leads.find((l: Lead) => l.phone === userPhone);
      if (!existingLead) {
        addLead({ name: name || 'Visitante WhatsApp', phone: userPhone, status: 'new', lastMessage: text, treatments: [] });
        setCurrentLeadId('created');
      }
    }

    const newUserMsg: Message = { id: uuidv4(), text, sender: 'user', timestamp: new Date(), type: 'text', status: 'sent' };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let responseText = '';
      let responseType: 'text' | 'image' | 'video' | 'audio' = 'text';
      let mediaUrl, audioDuration;

      const isQuestion = text.includes('?') || text.toLowerCase().match(/^(como|qual|quanto|onde|por que|quais|quero saber|queria saber|me fale|me explica|me conta)/i);
      const ragMatch = findResponse(text);

      if (ragMatch && (isQuestion || text.length > 5)) {
        responseText = `${ragMatch.responseText} Aproveitando a sua dúvida, você gostaria de agendar uma avaliação para conversarmos melhor?`;
        responseType = ragMatch.responseType;
        mediaUrl = ragMatch.mediaUrl;
        audioDuration = ragMatch.audioDuration;
      } else if (clientName && !text.toLowerCase().includes('marcar')) {
        responseText = `Que bom ver você de novo, ${clientName}! ✨ Em que posso te ajudar hoje?`;
      } else if (name && text.length < 50 && !text.toLowerCase().includes('marcar')) {
        responseText = `Prazer em te conhecer, ${name}! ✨ Você já tem algum tratamento em mente ou gostaria de uma avaliação geral?`;
      } else {
        const dayMatch = text.match(/dia\s+(\d+)/i);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          const targetDate = new Date(); targetDate.setDate(day);
          const freeSlots = checkAvailabilityForDay(targetDate);
          if (freeSlots.length > 0) {
            responseText = `Para o dia ${day}, tenho estes horários livres: ${freeSlots.join(', ')}. Algum fica bom?`;
          } else {
            responseText = `Puxa, o dia ${day} está lotado. Qual outro dia você prefere?`;
          }
        } else if (text.toLowerCase().match(/marcar|agendar|horário/)) {
          const targetDate = new Date(); targetDate.setHours(17, 0, 0, 0);
          const busy = events.some((ev: CalendarEvent) => targetDate < new Date(ev.end) && new Date(targetDate.getTime() + 3600000) > new Date(ev.start));
          responseText = busy
            ? 'Infelizmente às 17h de hoje a agenda está cheia. Qual dia você prefere?'
            : 'Posso marcar sua avaliação para hoje às 17:00. Fica bom?';
        } else if (text.toLowerCase().match(/tá bom|sim|pode ser|ok|confirmo/)) {
          responseText = 'Perfeito! Agendamento confirmado. A KAVI Clinic agradece pela confiança! ✨';
        } else {
          responseText = 'Como posso te ajudar hoje? Posso informar sobre procedimentos, tirar dúvidas ou marcar um horário para você.';
        }
      }

      const botResponse: Message = { id: uuidv4(), text: responseText, sender: 'bot', timestamp: new Date(), type: responseType, mediaUrl, audioDuration, status: 'read' };
      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  return (
    <div className="chat-container">
      {/* Modal de início */}
      {showModal && (
        <StartModal
          onSelectNew={handleSelectNew}
          onSelectKnown={handleSelectKnown}
          onClose={() => setShowModal(false)}
        />
      )}

      <ChatHeader
        contactName="KAVI Art Clinic"
        statusText={isTyping ? 'escrevendo...' : simStarted ? 'online' : 'simulador'}
      />

      <div className="message-list" onClick={handleInputAttempt}>
        {!simStarted && messages.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '12px',
            color: '#9ca3af', padding: '32px',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #008069, #25d366)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={28} color="#fff" />
            </div>
            <p style={{ fontSize: '14px', textAlign: 'center', lineHeight: 1.6, maxWidth: '220px', color: '#6b7280' }}>
              Clique no campo de mensagem ou no microfone para iniciar a simulação.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="message-row message-in">
            <div className="message-bubble" style={{ padding: '12px', fontStyle: 'italic', color: '#667781' }}>
              Digitando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onInputFocus={handleInputAttempt}
        onMicClick={handleInputAttempt}
        disabled={!simStarted}
      />
    </div>
  );
};
