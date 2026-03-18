import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ 
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Bar Banner - Expansível no Mobile */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          background: 'var(--primary)', 
          color: '#fff', 
          padding: '10px 32px', 
          fontSize: '13px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontWeight: 500,
          width: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ 
          background: 'var(--accent)', 
          borderRadius: '6px', 
          width: '24px', 
          height: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
          flexShrink: 0
        }}>
          <Info size={14} color="#fff" />
        </div>
        
        <span style={{ 
          opacity: 0.9,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isExpanded ? 'none' : 1,
          WebkitBoxOrient: 'vertical',
          flex: 1,
          lineHeight: '1.4'
        }}>
          {description}
        </span>

        <div style={{ opacity: 0.5, flexShrink: 0 }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      <div style={{ 
        padding: '20px 32px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: 'var(--primary)',
            letterSpacing: '-0.5px'
          }}>
            {title}
          </h2>
          <div style={{ 
            height: '4px', 
            width: '40px', 
            background: 'var(--accent)', 
            borderRadius: '2px',
            marginTop: '8px'
          }}></div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {actions}
        </div>
      </div>
    </div>
  );
};
