import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, Smile, Trash2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onInputFocus?: () => void;
  onMicClick?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onInputFocus, onMicClick, disabled }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    onSendMessage(`🎤 Áudio enviado (${formatTime(recordingTime)})`);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
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
        <div className="recording-instruction">Arraste para cancelar</div>
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
