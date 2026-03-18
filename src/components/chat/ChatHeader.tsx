import React from 'react';
import { Phone, MoreVertical, Search, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  contactName: string;
  statusText: string;
  avatarUrl?: string; // We can use Stethoscope icon if not provided
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ contactName, statusText, avatarUrl }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <div className="avatar cursor-pointer" onClick={() => navigate('/admin')} title="Acessar Admin (RAG)">
        {avatarUrl ? (
          <img src={avatarUrl} alt={contactName} />
        ) : (
          <Stethoscope size={24} color="#667781" />
        )}
      </div>
      
      <div className="header-info">
        <h2 className="contact-name">{contactName}</h2>
        <span className="contact-status">{statusText}</span>
      </div>

      <div className="header-actions">
        <Search size={20} className="cursor-pointer" />
        <Phone size={20} className="cursor-pointer" />
        <div className="cursor-pointer" onClick={() => navigate('/admin')} title="Admin Treinamento">
          <MoreVertical size={20} />
        </div>
      </div>
    </div>
  );
};
