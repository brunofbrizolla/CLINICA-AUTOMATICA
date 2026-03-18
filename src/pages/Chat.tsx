import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble, Message } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useRag } from '../store/RagContext';
import { useCrm, Lead } from '../store/CrmContext';
import { useAgenda, CalendarEvent } from '../store/AgendaContext';
import { User, UserCheck, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { openai } from '../lib/openai';

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

  const triggerBotResponse = async (userText: string, currentHistory: Message[]) => {
    setIsTyping(true);
    const ragMatch = findResponse(userText);
    
    // Converte o histórico de mensagens
    const chatHistory: any[] = currentHistory.map(m => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text
    }));
    chatHistory.push({ role: 'user', content: userText });

    let systemPrompt = `Você é Roberta, uma assistente virtual amigável, acolhedora e educada (mas não excessiva) da KAVI Art Clinic.
Seu objetivo é ajudar os pacientes, tirar dúvidas sobre tratamentos estéticos/odontológicos e captar agendamentos.
Aja como uma humana real conversando no WhatsApp. Respostas curtas e diretas. Use emojis de vez em quando.`;

    if (clientName) {
      systemPrompt += `\nO paciente com que você está falando é um cliente chamado ${clientName}. Trate-o com familiaridade.`;
    }

    const today = new Date();
    systemPrompt += `\nHoje é ${today.toLocaleDateString('pt-BR')}, ${today.toLocaleTimeString('pt-BR')}.`;

    if (ragMatch) {
      systemPrompt += `\n\n[INFORMAÇÃO IMPORTANTE DA CLÍNICA]\nCom base na dúvida do paciente, a resposta oficial da clínica sobre o assunto é: "${ragMatch.responseText}".\nUse essa informação para responder de forma super carismática.`;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const responseText = completion.choices[0].message.content || 'Desculpe, ocorreu um erro de comunicação.';
      
      const botResponse: Message = { 
        id: uuidv4(), 
        text: responseText, 
        sender: 'bot', 
        timestamp: new Date(), 
        type: ragMatch?.responseType || 'text', 
        mediaUrl: ragMatch?.mediaUrl, 
        audioDuration: ragMatch?.audioDuration, 
        status: 'read' 
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    } catch (err: any) {
      console.error('Erro na API OpenAI:', err);
      const errMsg = err?.message?.includes('401') 
        ? '⚠️ Chave da OpenAI não configurada corretamente ou sem saldo.' 
        : '⚠️ Erro ao contactar a IA. Tente novamente.';
        
      const botResponse: Message = { id: uuidv4(), text: errMsg, sender: 'bot', timestamp: new Date(), type: 'text', status: 'read' };
      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    }
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
    
    // Dispara a IA
    triggerBotResponse(text, messages);
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!simStarted) { setShowModal(true); return; }

    const processingMsgId = uuidv4();
    const processingMsg: Message = { id: processingMsgId, text: '🎤 Processando áudio (Whisper)...', sender: 'user', timestamp: new Date(), type: 'text', status: 'sent' };
    setMessages(prev => [...prev, processingMsg]);

    try {
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'pt'
      });
      
      const text = transcription.text;
      
      // Atualiza a msg temporária para o texto transcrito
      setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, text: `🎤 [Áudio]: "${text}"` } : m));
      
      // Dispara o bot passando também essa mensagem transcrita no histórico?
      // actually, just triggers bot with transcibed text and current messages
      triggerBotResponse(text, messages);
      
    } catch (err: any) {
      console.error('Erro na transcrição de áudio:', err);
      setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, text: '🎤 Erro ao transcrever o áudio. Verifique sua chave da OpenAI.' } : m));
    }
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
        onSendAudio={handleSendAudio}
        onInputFocus={handleInputAttempt}
        onMicClick={handleInputAttempt}
        disabled={!simStarted}
      />
    </div>
  );
};
