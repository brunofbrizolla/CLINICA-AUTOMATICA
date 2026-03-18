import { Info } from 'lucide-react';
import { CustomCalendarView } from '../components/agenda/CustomCalendarView';
import { PageHeader } from '../components/layout/PageHeader';

export const Agenda: React.FC = () => {
  return (
    <div className="agenda-page-container">
      <PageHeader 
        title="Agenda da Clínica"
        description="Aqui é onde seus agendamentos são registrados. Você poderá marcar manualmente, e os agendamentos da automação aparecerão aqui."
      />

      <div className="agenda-wrapper">
        <CustomCalendarView />
      </div>
    </div>
  );
};
