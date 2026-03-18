import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble, Message } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useRag } from '../store/RagContext';
import { useCrm, Lead } from '../store/CrmContext';
import { useAgenda, CalendarEvent } from '../store/AgendaContext';
import { User, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { openai } from '../lib/openai';
import { supabase } from '../lib/supabase';

// ── Modal de início de simulação (Com PIN) ───────────────────────────────────
interface StartModalProps {
  onStart: (pin: string, clientName: string | null, history: Message[]) => void;
  onClose: () => void;
}

const StartModal: React.FC<StartModalProps> = ({ onStart, onClose }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (pin.length !== 4 || isNaN(Number(pin))) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('chat_sessions').select('*').eq('pin', pin).single();
      if (data) {
        onStart(pin, data.client_name, data.history || []);
      } else {
        await supabase.from('chat_sessions').insert({ pin });
        onStart(pin, null, []);
      }
    } catch (err) {
      console.error('Erro ao acessar sessões do chat:', err);
      onStart(pin, null, []);
    }
    setLoading(false);
  };

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
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#9ca3af',
        }}>
          <X size={18} />
        </button>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
          PIN de Teste
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px', lineHeight: 1.5 }}>
          Digite 4 números. O seu histórico de testes ficará salvo e atrelado a esse PIN.
        </p>

        <input
          autoFocus
          type="text"
          maxLength={4}
          placeholder="Ex: 5821"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleStart()}
          style={{
            width: '100%', padding: '14px', textAlign: 'center', letterSpacing: '4px',
            border: '1.5px solid #d1d5db', borderRadius: '10px',
            fontSize: '20px', fontWeight: 600, outline: 'none', boxSizing: 'border-box',
            marginBottom: '16px', transition: 'border-color 0.2s',
          }}
        />

        <button
          onClick={handleStart}
          disabled={pin.length !== 4 || loading}
          style={{
            width: '100%', padding: '14px',
            background: pin.length === 4 ? 'linear-gradient(135deg, #008069, #25d366)' : '#e5e7eb',
            color: pin.length === 4 ? '#fff' : '#9ca3af',
            border: 'none', borderRadius: '12px',
            cursor: pin.length === 4 && !loading ? 'pointer' : 'not-allowed',
            fontSize: '14px', fontWeight: 700, transition: 'all 0.2s',
          }}
        >
          {loading ? 'Carregando...' : 'Entrar no Chat'}
        </button>
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
  const { findResponse, knowledgeBase } = useRag();
  const { addLead, updateLead, leads } = useCrm();
  const { events, addEvent, deleteEvent, updateEvent } = useAgenda();

  const [simStarted, setSimStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sessionPin, setSessionPin] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [procedures, setProcedures] = useState<{ name: string; duration_minutes: number }[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Carrega procedimentos do Supabase
  useEffect(() => {
    supabase.from('procedures').select('name, duration_minutes').then(({ data }) => {
      if (data) setProcedures(data);
    });
  }, []);

  // Persistência automática do histórico
  useEffect(() => {
    if (simStarted && sessionPin && messages.length > 0) {
      supabase.from('chat_sessions').update({ history: messages }).eq('pin', sessionPin).then();
    }
  }, [messages, simStarted, sessionPin]);

  const handleStartSession = (pin: string, dbClientName: string | null, history: Message[]) => {
    setSessionPin(pin);
    setClientName(dbClientName);
    setMessages(history && history.length > 0 ? history : []);
    setSimStarted(true);
    setShowModal(false);
  };

  const handleInputAttempt = () => {
    if (!simStarted) setShowModal(true);
  };

  // ── Helpers ──
  const extractInfo = (text: string) => {
    const nameRegex = /(?:meu nome é|me chamo|aqui é o|aqui é a|sou o|sou a)\s+([A-ZÀ-Úa-zà-ú]+(?:\s+[A-ZÀ-Úa-zà-ú]+)*)/i;
    const nameMatch = text.match(nameRegex);
    return { name: nameMatch ? nameMatch[1] : null };
  };

  /** Detecta se a mensagem tem tom de raiva ou frustração */
  const isFrustrated = (text: string) => {
    const keywords = /absurdo|ridículo|horrível|péssim|nunca mais|decepcionad|pior|incompetente|falta de respeito|que saco|que merda/i;
    return keywords.test(text);
  };

  /** Calcula duração do procedimento em ms (padrão 60min) */
  const getProcedureDuration = (procedureName: string): number => {
    const proc = procedures.find(p =>
      p.name.toLowerCase().includes(procedureName.toLowerCase()) ||
      procedureName.toLowerCase().includes(p.name.toLowerCase())
    );
    return (proc?.duration_minutes || 60) * 60 * 1000;
  };

  /** Verifica horários já ocupados em uma data */
  const getOccupiedSlots = (date: string): string[] => {
    return events
      .filter(e => {
        const evDate = new Date(e.start);
        const [y, m, d] = date.split('-');
        return evDate.getFullYear() === Number(y) &&
               evDate.getMonth() + 1 === Number(m) &&
               evDate.getDate() === Number(d);
      })
      .map(e => new Date(e.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  };

  /** Formata data por extenso: "quinta-feira, 19 de março" */
  const formatDateByExtensive = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // ── Lógica de resposta do bot ──────────────────────────────────────────────
  const triggerBotResponse = async (userText: string, currentHistory: Message[]) => {
    setIsTyping(true);
    const ragMatch = findResponse(userText);

    const chatHistory: any[] = currentHistory.map(m => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text
    }));
    chatHistory.push({ role: 'user', content: userText });

    // ── System Prompt ──
    let systemPrompt = `Você é Roberta, secretária da KAVI Art Clinic.
Seu objetivo é ajudar os pacientes, tirar dúvidas sobre tratamentos estéticos/odontológicos e captar agendamentos.
Aja como uma humana real conversando no WhatsApp — nunca diga que é uma IA, robô, assistente virtual ou chatbot. Se alguém perguntar, diga que é a Roberta, secretária da clínica.
Seja muito natural, respostas bem curtas e diretas. NÃO seja prolixa ou robótica.
Use emojis com moderação, apenas quando fizer sentido no contexto.`;

    // Tom de empatia se paciente frustrado
    if (isFrustrated(userText)) {
      systemPrompt += `\n⚠️ ATENÇÃO: O paciente parece frustrado ou insatisfeito. Responda com MUITA empatia, peça desculpas sinceramente, e tente resolver o problema imediatamente sem enrolação.`;
    }

    // Estágio da conversa
    const isReturning = currentHistory.length > 0 && clientName;
    if (currentHistory.length === 0) {
      systemPrompt += `\nIMPORTANTE: Esta é a PRIMEIRA mensagem do paciente. Dê boas-vindas à KAVI Art Clinic, apresente-se como Roberta e pergunte o nome do paciente de forma educada e acolhedora.`;
    } else if (clientName) {
      systemPrompt += `\nVocê já conhece o paciente, o nome dele é ${clientName}. Trate-o pelo nome.${isReturning ? ' Este paciente já tem histórico conosco — seja ainda mais acolhedora.' : ''} SEJA PROATIVA: sempre pergunte como pode ajudar, se ele deseja agendar uma consulta ou tirar dúvidas sobre os procedimentos.`;
    } else {
      systemPrompt += `\n🚨 REGRA DE IDENTIFICAÇÃO: Você ainda não sabe o nome desta pessoa. Peça o nome dela de forma simpática. Assim que ela disser o nome, chame 'register_patient_name' e continue a conversa exatamente de onde pararam, incorporando o nome dela naturalmente. Não reinicie o atendimento e não ignore o que já foi falado anteriormente.`;
    }

    // Data e hora
    const today = new Date();
    const weekday = today.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('pt-BR');
    const timeStr = today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    systemPrompt += `\n\nDATA E HORA ATUAL: Hoje é ${weekday}, ${dateStr}, agora são ${timeStr}.
- Se o paciente mencionar "hoje", não diga que a data já passou.
- Ao confirmar agendamentos, use o formato por extenso: "quinta-feira, 19 de março".

REGRAS DE AGENDAMENTO:
  1. Quando o paciente escolher um DIA, pergunte: "Você prefere de manhã ou tarde?"
  2. Quando ele responder manhã/tarde, sugira 2-3 horários REAIS disponíveis (veja a lista de horários ocupados abaixo).
  3. Só chame schedule_appointment quando o paciente CONFIRMAR claramente o horário.
  4. Se todos os horários do período estiverem ocupados, sugira outro dia ou período.

REGRA DE CANCELAMENTO: Se pedir cancelamento, chame cancel_appointment IMEDIATAMENTE com o ID correto.
REGRA DE REMARCAÇÃO: Se pedir para MUDAR o horário de uma consulta existente, chame reschedule_appointment.`;

    // Procedimentos disponíveis com duração
    if (procedures.length > 0) {
      const procList = procedures.map(p => `${p.name} (${p.duration_minutes}min)`).join(', ');
      systemPrompt += `\n\nPROCEDIMENTOS DA CLÍNICA: ${procList}`;
    }

    // Especialistas — não perguntar preferência ao paciente, sempre "A definir"
    systemPrompt += `\nESPECIALISTAS: Dra. Kátia Fragoso e Dra. Victória Berenice. NÃO pergunte ao paciente qual especialista prefere, simplesmente agende como "A definir" e a clínica definirá internamente.`;

    // Agendamentos do paciente
    const myEvents = events.filter((e: CalendarEvent) =>
      e.whatsapp === sessionPin ||
      (clientName && e.patientName?.toLowerCase() === clientName.toLowerCase())
    );
    if (myEvents.length > 0) {
      const eventList = myEvents.map((e: CalendarEvent) =>
        `- ID: ${e.id} | ${e.procedure} | ${formatDateByExtensive(new Date(e.start))} às ${new Date(e.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} | Especialista: ${e.specialistName}`
      ).join('\n');
      systemPrompt += `\n\nAGENDAMENTOS DESSE PACIENTE:\n${eventList}\nUse os IDs EXATOS nas funções de cancelamento/remarcação. NUNCA invente IDs.`;
    } else {
      systemPrompt += `\n\nEsse paciente não tem agendamentos no sistema.`;
    }

    // Horários ocupados nos próximos 7 dias (para sugerir horários reais)
    const nextDays: string[] = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const occupied = getOccupiedSlots(ds);
      if (occupied.length > 0) {
        nextDays.push(`${d.toLocaleDateString('pt-BR')} (${d.toLocaleDateString('pt-BR', { weekday: 'short' })}): ocupados às ${occupied.join(', ')}`);
      }
    }
    if (nextDays.length > 0) {
      systemPrompt += `\n\nHORÁRIOS JÁ OCUPADOS NA AGENDA:\n${nextDays.join('\n')}\nNÃO sugira horários que já estão ocupados!`;
    }

    // Horários de funcionamento
    systemPrompt += `\nHORÁRIO DA CLÍNICA: Segunda a sexta das 08:00 às 18:00, sábados das 08:00 às 13:00. Não agende fora desses horários.`;

    // RAG match
    if (ragMatch) {
      systemPrompt += `\n\n[RESPOSTA OFICIAL DA CLÍNICA]\nSobre a dúvida do paciente: "${ragMatch.responseText}". Use isso para responder com carisma.`;
    }

    // Regra de imagens/resultados
    systemPrompt += `\n\nREGRA DE RESULTADOS: Quando o paciente perguntar sobre um procedimento estético (Botox, facetas, harmonização, implante, etc.) e você terminar de explicar, SEMPRE pergunte de forma natural: "Quer ver alguns resultados antes e depois?" (ou variações naturais disso). Se ele responder "sim" ou positivamente, chame a função send_procedure_results com o nome do procedimento. Se ele responder "não" ou negativamente, pergunte: "Entendido! Deseja agendar uma avaliação ou tem alguma outra dúvida?".`;

    // ── Ferramentas ──
    const tools = [
      {
        type: "function",
        function: {
          name: "register_patient_name",
          description: "Salva o nome REAL do paciente quando ele explicitamente disser como se chama. NUNCA chame esta função com nomes genéricos como 'Usuário', 'Paciente', 'Cliente', 'Nome', ou qualquer coisa que não seja o nome real fornecido pelo próprio paciente. Só chame quando o paciente realmente se apresentar.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "O nome ou apelido REAL do paciente, exatamente como ele disse" }
            },
            required: ["name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "schedule_appointment",
          description: "Agenda uma consulta. Chame APENAS quando o paciente confirmar claramente o dia, horário e procedimento. Opcionalmente pode incluir especialista preferida.",
          parameters: {
            type: "object",
            properties: {
              date: { type: "string", description: "Data no formato YYYY-MM-DD" },
              time: { type: "string", description: "Horário no formato HH:MM" },
              procedure: { type: "string", description: "Nome do procedimento" },
              patient_name: { type: "string", description: "Nome do paciente" },
              specialist_name: { type: "string", description: "Nome da especialista preferida (ou 'A definir')" }
            },
            required: ["date", "time", "procedure", "patient_name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "cancel_appointment",
          description: "Cancela um agendamento existente quando o paciente pedir para desmarcar.",
          parameters: {
            type: "object",
            properties: {
              event_id: { type: "string", description: "ID exato do agendamento (da lista de agendamentos acima)" },
              patient_name: { type: "string", description: "Nome do paciente" }
            },
            required: ["event_id", "patient_name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "reschedule_appointment",
          description: "Remarca (muda data/hora) de um agendamento existente sem cancelar e recriar.",
          parameters: {
            type: "object",
            properties: {
              event_id: { type: "string", description: "ID exato do agendamento a ser remarcado" },
              new_date: { type: "string", description: "Nova data no formato YYYY-MM-DD" },
              new_time: { type: "string", description: "Novo horário no formato HH:MM" },
              patient_name: { type: "string", description: "Nome do paciente" }
            },
            required: ["event_id", "new_date", "new_time", "patient_name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "send_procedure_results",
          description: "Envia imagens de resultados (antes e depois) de um procedimento quando o paciente confirmar que quer ver. Só chame após o paciente dizer 'sim' ou demonstrar interesse em ver as fotos.",
          parameters: {
            type: "object",
            properties: {
              procedure: { type: "string", description: "Nome do procedimento (ex: Botox, harmonização, facetas, implante)" }
            },
            required: ["procedure"]
          }
        }
      }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory
        ],
        tools: tools as any,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 500, // Aumentado de 300 para evitar cortes
      });

      const choice = completion.choices[0];
      let responseText = choice.message.content || '';
      let responseMediaUrl: string | undefined = undefined;
      let responseMediaType: 'text' | 'image' | 'video' | 'audio' = ragMatch?.responseType || 'text';
      let responseAudioDuration: string | undefined = ragMatch?.audioDuration;

      // ── Processa tool calls ──
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0] as any;
        const args = JSON.parse(toolCall.function.arguments);

        // 1. Registrar nome
        if (toolCall.function.name === 'register_patient_name') {
          const realName: string = args.name?.trim();

          // Rejeita nomes genéricos — a IA não deve inventar
          const genericNames = ['usuário', 'paciente', 'cliente', 'nome', 'user', 'pessoa', 'anônimo'];
          if (!realName || genericNames.includes(realName.toLowerCase())) {
            responseText = responseText || `Desculpa insistir, mas preciso do seu nome para prosseguir! Como posso te chamar? 😊`;
          } else {
          setClientName(realName);
          if (sessionPin) {
            supabase.from('chat_sessions').update({ client_name: realName }).eq('pin', sessionPin).then();
          }
          // Cria ou atualiza lead no CRM com o nome real
          const userPhone = sessionPin || '912345678';
          const existingLead = leads.find((l: Lead) => l.phone === userPhone);
          if (existingLead) {
            await updateLead(existingLead.id, { name: realName });
            setCurrentLeadId(existingLead.id);
          } else if (!currentLeadId) {
            await addLead({ name: realName, phone: userPhone, status: 'new', lastMessage: '', treatments: [] });
            setCurrentLeadId('created');
          }
          if (!responseText) {
              responseText = `Muito prazer em te conhecer, ${realName}! 😊 Como posso te ajudar hoje? Quer tirar dúvidas sobre nossos tratamentos ou gostaria de agendar uma avaliação?`;
            }
          } // fim do else (nome válido)
        }

        // 2. Agendar
        else if (toolCall.function.name === 'schedule_appointment') {
          try {
            const [year, month, day] = args.date.split('-');
            const [hour, min] = args.time.split(':');
            const startDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min));

            // Verifica conflito de horário
            const conflict = events.find(e => {
              const evStart = new Date(e.start).getTime();
              const evEnd = new Date(e.end).getTime();
              const reqStart = startDate.getTime();
              return reqStart >= evStart && reqStart < evEnd;
            });
            if (conflict) {
              responseText = `Poxa, esse horário já está reservado 😅 Posso te oferecer outro horário bem próximo — quer de manhã ou tarde?`;
            } else {
              const duration = getProcedureDuration(args.procedure);
              const endDate = new Date(startDate.getTime() + duration);
              const specialistName = args.specialist_name || 'A definir';

              const newEvent: Omit<CalendarEvent, 'id'> = {
                title: `Avaliação: ${args.procedure}`,
                patientName: args.patient_name || clientName || 'Paciente',
                specialistName,
                procedure: args.procedure,
                value: 'A avaliar',
                whatsapp: sessionPin || '',
                start: startDate,
                end: endDate,
                allDay: false
              };

              await addEvent(newEvent);

              // Atualiza status do lead no CRM para "scheduled"
              const userPhone = sessionPin || '912345678';
              const leadToUpdate = leads.find((l: Lead) => l.phone === userPhone);
              if (leadToUpdate) {
                await updateLead(leadToUpdate.id, { status: 'scheduled', lastMessage: `Agendou: ${args.procedure}` });
              }

              const datePretty = formatDateByExtensive(startDate);
              const confirmMsg = `✅ Agendamento confirmado!\n${args.procedure} marcado para ${datePretty} às ${args.time}${specialistName !== 'A definir' ? ` com ${specialistName}` : ''}. Te esperamos lá, ${args.patient_name}! 🎉`;
              responseText = responseText ? `${responseText}\n\n${confirmMsg}` : confirmMsg;
            }
          } catch (e) {
            console.error('Erro ao salvar agendamento:', e);
            responseText = `Tive um probleminha técnico para salvar o agendamento. Pode repetir o dia e o horário?`;
          }
        }

        // 3. Cancelar
        else if (toolCall.function.name === 'cancel_appointment') {
          const eventToCancel = events.find((e: CalendarEvent) => e.id === args.event_id);
          if (!eventToCancel) {
            responseText = `Não encontrei nenhum agendamento com esse ID. Pode me confirmar o nome exato usado no agendamento?`;
          } else {
            try {
              await deleteEvent(args.event_id);
              // Atualiza status do lead no CRM de volta para "in-progress"
              const userPhone = sessionPin || '912345678';
              const leadToUpdate = leads.find((l: Lead) => l.phone === userPhone);
              if (leadToUpdate) {
                await updateLead(leadToUpdate.id, { status: 'in-progress', lastMessage: `Cancelou: ${eventToCancel.procedure}` });
              }
              const datePretty = formatDateByExtensive(new Date(eventToCancel.start));
              const cancelMsg = `❌ Cancelado! ${args.patient_name}, sua consulta de ${eventToCancel.procedure} em ${datePretty} foi desmarcada. Se quiser remarcar, é só me chamar 😊`;
              responseText = responseText ? `${responseText}\n\n${cancelMsg}` : cancelMsg;
            } catch (e) {
              console.error('Erro ao cancelar:', e);
              responseText = `Tive um problema técnico para cancelar. Pode me confirmar qual era o agendamento?`;
            }
          }
        }

        // 4. Remarcar
        else if (toolCall.function.name === 'reschedule_appointment') {
          const eventToMove = events.find((e: CalendarEvent) => e.id === args.event_id);
          if (!eventToMove) {
            responseText = `Não encontrei esse agendamento no sistema. Pode me confirmar qual consulta deseja remarcar?`;
          } else {
            try {
              const [year, month, day] = args.new_date.split('-');
              const [hour, min] = args.new_time.split(':');
              const newStart = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min));

              // Verifica conflito no novo horário
              const conflict = events.find(e => {
                if (e.id === args.event_id) return false; // ignora o próprio evento
                const evStart = new Date(e.start).getTime();
                const evEnd = new Date(e.end).getTime();
                const reqStart = newStart.getTime();
                return reqStart >= evStart && reqStart < evEnd;
              });
              if (conflict) {
                responseText = `Esse novo horário já está ocupado 😅 Quer que eu te sugira outro horário disponível?`;
              } else {
                const duration = getProcedureDuration(eventToMove.procedure);
                const newEnd = new Date(newStart.getTime() + duration);
                await updateEvent(args.event_id, { start: newStart, end: newEnd });

                // Atualiza last_message no CRM
                const userPhone = sessionPin || '912345678';
                const leadToUpdate = leads.find((l: Lead) => l.phone === userPhone);
                if (leadToUpdate) {
                  await updateLead(leadToUpdate.id, { lastMessage: `Remarcou: ${eventToMove.procedure} para ${args.new_date}` });
                }

                const datePretty = formatDateByExtensive(newStart);
                const rescheduleMsg = `🔄 Remarcado com sucesso! ${args.patient_name}, sua consulta de ${eventToMove.procedure} foi transferida para ${datePretty} às ${args.new_time}. Qualquer coisa, estou por aqui! 😊`;
                responseText = responseText ? `${responseText}\n\n${rescheduleMsg}` : rescheduleMsg;
              }
            } catch (e) {
              console.error('Erro ao remarcar:', e);
              responseText = `Tive um problema técnico para remarcar. Pode me informar o novo dia e horário novamente?`;
            }
          }
        }

        // 5. Enviar resultados de procedimento
        else if (toolCall.function.name === 'send_procedure_results') {
          const procName: string = args.procedure?.toLowerCase() || '';
          // Busca imagem no RAG pelo nome do procedimento
          const imageEntry = knowledgeBase.find(entry =>
            entry.responseType === 'image' &&
            entry.mediaUrl &&
            (entry.triggerPhrase.toLowerCase().includes(procName) ||
             procName.includes(entry.triggerPhrase.toLowerCase()))
          );
          if (imageEntry && imageEntry.mediaUrl) {
            responseText = responseText || `Olha só alguns resultados do ${args.procedure}!`;
            responseMediaUrl = imageEntry.mediaUrl;
            responseMediaType = 'image';
          } else {
            responseText = responseText || `Ainda não temos fotos de ${args.procedure} cadastradas, mas posso agendar uma avaliação para você conhecer de perto o trabalho da clínica. O que acha?`;
          }
        }
      }

      const botResponse: Message = {
        id: uuidv4(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        type: responseMediaUrl ? responseMediaType : (ragMatch?.responseType || 'text'),
        mediaUrl: responseMediaUrl || ragMatch?.mediaUrl,
        audioDuration: responseAudioDuration,
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
    if (name && !clientName) {
      setClientName(name);
      if (sessionPin) {
        supabase.from('chat_sessions').update({ client_name: name }).eq('pin', sessionPin).then();
      }
    }

    // Atualiza last_message no CRM se já tiver lead
    const userPhone = sessionPin || '912345678';
    const existingLead = leads.find((l: Lead) => l.phone === userPhone);
    if (existingLead) {
      updateLead(existingLead.id, { lastMessage: text });
    }

    const newUserMsg: Message = { id: uuidv4(), text, sender: 'user', timestamp: new Date(), type: 'text', status: 'sent' };
    setMessages(prev => [...prev, newUserMsg]);
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
        file,
        model: 'whisper-1',
        language: 'pt'
      });

      const text = transcription.text;
      // Atualiza a mensagem de áudio sem revelar o texto transcrito (como no WhatsApp)
      setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, text: `🎤 Áudio` } : m));

      const { name } = extractInfo(text);
      if (name && !clientName) {
        setClientName(name);
        supabase.from('chat_sessions').update({ client_name: name }).eq('pin', sessionPin).then();
      }

      triggerBotResponse(text, messages);
    } catch (err: any) {
      console.error('Erro na transcrição de áudio:', err);
      setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, text: '🎤 Erro ao transcrever o áudio.' } : m));
    }
  };

  return (
    <div className="chat-container">
      {showModal && (
        <StartModal
          onStart={handleStartSession}
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
