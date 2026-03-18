import React, { useState, useRef, useEffect } from 'react';
import { Check, CheckCheck, Play, Pause } from 'lucide-react';

export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: MessageType;
  mediaUrl?: string;
  audioDuration?: string;
  status: 'sent' | 'delivered' | 'read';
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (message.type === 'audio' && message.mediaUrl) {
      audioRef.current = new Audio(message.mediaUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [message]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <>
            {message.mediaUrl && (
              <div className="message-media">
                <img src={message.mediaUrl} alt="Media" loading="lazy" />
              </div>
            )}
            {message.text && <div className="message-content" style={{ marginTop: '4px' }}>{message.text}</div>}
          </>
        );
      case 'video':
        return (
          <>
            {message.mediaUrl && (
              <div className="message-media">
                <video src={message.mediaUrl} controls preload="metadata" />
              </div>
            )}
            {message.text && <div className="message-content" style={{ marginTop: '4px' }}>{message.text}</div>}
          </>
        );
      case 'audio':
        return (
          <div className="message-audio">
            <div className="speaker-avatar" style={{width: 40, height: 40, borderRadius: '50%', background: '#ccc', flexShrink: 0}} />
            <div className="audio-play-btn" onClick={toggleAudio}>
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </div>
            <div className="audio-progress">
              <div className="audio-progress-bar" style={{ width: isPlaying ? '50%' : '0%' }}></div>
            </div>
            <div className="audio-duration">
              {message.audioDuration || '0:00'}
            </div>
          </div>
        );
      case 'text':
      default:
        return <div className="message-content">{message.text}</div>;
    }
  };

  return (
    <div className={`message-row ${isUser ? 'message-out' : 'message-in'}`}>
      <div className="message-bubble">
        {renderContent()}
        
        <div className="message-footer">
          <span className="message-time">{timeString}</span>
          {isUser && (
            <span className={`message-status ${message.status === 'read' ? 'read' : ''}`}>
              {message.status === 'sent' ? <Check size={14} /> : <CheckCheck size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
