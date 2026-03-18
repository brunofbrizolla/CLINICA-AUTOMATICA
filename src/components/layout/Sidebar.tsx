import { MessageSquare, Calendar, Users, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      {/* Brand Icon - Stylized via CSS classes */}
      <div className="sidebar-brand">
        <div className="brand-icon">K</div>
      </div>
      
      <div className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          title="Chat do Paciente"
        >
          <MessageSquare size={22} />
          <span>Chat</span>
        </NavLink>
        
        <NavLink 
          to="/agenda" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          title="Agenda da Clínica"
        >
          <Calendar size={22} />
          <span>Agenda</span>
        </NavLink>

        <NavLink 
          to="/crm" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          title="Gestão de Clientes"
        >
          <Users size={22} />
          <span>Pacientes</span>
        </NavLink>

        <NavLink 
          to="/procedures" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          title="Procedimentos / Tratamentos"
        >
          <Activity size={22} />
          <span>Procedimentos</span>
        </NavLink>
      </div>
    </div>
  );
};
