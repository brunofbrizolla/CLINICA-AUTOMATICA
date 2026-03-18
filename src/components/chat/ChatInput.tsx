import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, Smile, Trash2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onInputFocus?: () => void;
  onMicClick?: () => void;
  disabled?: boolean;
  onSendAudio?: (audioBlob: Blob) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onInputFocus, onMicClick, disabled, onSendAudio }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (onSendAudio) {
            onSendAudio(audioBlob);
          } else {
            onSendMessage(`🎤 Áudio capturado (${formatTime(recordingTime)}) - Não configurado para envio.`);
          }
        }
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Erro ao acessar o microfone', err);
      alert('Não foi possível acessar o seu microfone. Verifique as permissões de áudio do seu navegador.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Limpa os chunks para não enviar no evento onstop
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // reset
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isRecording) {
    return (
      <div className="chat-input-container recording-state">
        <button className="btn-icon delete-recording" onClick={cancelRecording}>
          <Trash2 size={22} color="#f44336" />
        </button>
        <div className="recording-status">
          <div className="mic-dot"></div>
          <span className="recording-timer">{formatTime(recordingTime)}</span>
        </div>
        <div className="recording-instruction">Toque na lixeira para cancelar</div>
        <button className="btn-icon send-audio" onClick={stopRecording} style={{ backgroundColor: '#00a884', color: 'white' }}>
          <Send size={24} style={{ marginLeft: '4px' }} />
        </button>
      </div>
    );
  }

  return (
    <div className="chat-input-container">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Mensagem"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
          disabled={disabled}
          rows={1}
        />
      </div>

      {text.trim() ? (
        <button className="btn-icon" onClick={handleSend} style={{ backgroundColor: '#00a884', color: 'white' }}>
          <Send size={24} style={{ marginLeft: '4px' }} />
        </button>
      ) : (
        <button className="btn-icon mic-btn" onClick={() => { onMicClick && onMicClick(); startRecording(); }} disabled={disabled}>
          <Mic size={24} />
        </button>
      )}
    </div>
  );
};
