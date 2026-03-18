import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes, addDays, eachDayOfInterval, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAgenda, CalendarEvent } from '../../store/AgendaContext';
import { useProcedures } from '../../store/ProcedureContext';
import { useCrm, Lead } from '../../store/CrmContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ─── Toolbar customizada (inclui header de dias) ──────────────────────────────
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const view: View = toolbar.view;
  const currentDate: Date = toolbar.date;

  // Calcula os dias da semana para mostrar acima do grid
  const weekDays = useMemo(() => {
    if (view !== 'week') return [];
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  }, [view, currentDate]);

  const today = new Date();

  return (
    <div>
      {/* Navbar: período + setas + botões de visão */}
      <div className="rbc-toolbar custom-compact-toolbar">
        <div className="toolbar-nav-section">
          <button className="nav-btn" onClick={goToBack} title="Anterior">
            <ChevronLeft size={16} />
          </button>
          <span className="rbc-toolbar-label">{toolbar.label}</span>
          <button className="nav-btn" onClick={goToNext} title="Próximo">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="rbc-btn-group view-switcher">
          <button className={view === 'month' ? 'rbc-active' : ''} onClick={() => toolbar.onView('month')}>Mês</button>
          <button className={view === 'week'  ? 'rbc-active' : ''} onClick={() => toolbar.onView('week')}>Semana</button>
          <button className={view === 'day'   ? 'rbc-active' : ''} onClick={() => toolbar.onView('day')}>Dia</button>
        </div>
      </div>

      {/* Header de dias — só na visão Semana */}
      {view === 'week' && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          paddingLeft: '50px',
        }}>
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '3px 1px',
                borderLeft: i > 0 ? '1px solid #f0f0f0' : 'none',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'lowercase' as const }}>
                  {format(day, 'eee', { locale: ptBR })}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isToday ? '#fff' : '#008069',
                  backgroundColor: isToday ? '#008069' : 'transparent',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1px',
                }}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Header de dias — só visão Dia */}
      {view === 'day' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px 4px 58px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fff',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'lowercase' as const }}>
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </span>
          <span style={{
            fontSize: '15px', fontWeight: 700,
            color: currentDate.toDateString() === today.toDateString() ? '#fff' : '#008069',
            backgroundColor: currentDate.toDateString() === today.toDateString() ? '#008069' : 'transparent',
            borderRadius: '50%', width: '26px', height: '26px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {format(currentDate, 'd')}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────
export const CustomCalendarView: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useAgenda();
  const { procedures } = useProcedures();
  const { leads } = useCrm();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);

  const [formData, setFormData] = useState({
    patientName: '', specialistName: '', procedure: '',
    value: '', whatsapp: '', start: new Date(), end: new Date()
  });

  const formattedEvents = useMemo(() =>
    events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    })),
  [events]);

  const components = useMemo(() => ({
    toolbar: CustomToolbar,
    event: ({ event }: { event: CalendarEvent }) => (
      <div className="custom-event">
        <strong>{event.title}</strong>
      </div>
    ),
  }), []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setFormData({ patientName: '', specialistName: '', procedure: '', value: '', whatsapp: '', start, end });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setFormData({
      patientName: event.patientName || '',
      specialistName: event.specialistName || '',
      procedure: event.procedure || '',
      value: event.value || '',
      whatsapp: event.whatsapp || '',
      start: new Date(event.start),
      end: new Date(event.end)
    });
    setIsModalOpen(true);
  };

  const checkConflict = (start: Date, end: Date, currentId?: string) =>
    events.some(ev => {
      if (currentId && ev.id === currentId) return false;
      return (start < new Date(ev.end) && end > new Date(ev.start));
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkConflict(formData.start, formData.end, selectedEvent?.id)) {
      alert('⚠️ Erro: Este horário já está ocupado por outro agendamento.');
      return;
    }
    const eventData = { ...formData, title: `${formData.patientName} - ${formData.procedure}` };
    if (selectedEvent?.id) { updateEvent(selectedEvent.id, eventData); }
    else { addEvent(eventData); }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedEvent?.id) { deleteEvent(selectedEvent.id); setIsModalOpen(false); }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div className="calendar-container">
      <div className="calendar-body">
        <Calendar
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: '100%' }}
          culture="pt-BR"
          view={currentView}
          onView={(v: View) => setCurrentView(v)}
          date={currentDate}
          onNavigate={(d: Date) => setCurrentDate(d)}
          views={['month', 'week', 'day']}
          formats={{
            dayFormat: (date: Date, culture: any, loc: any) => loc.format(date, 'eee', culture),
            weekdayFormat: (date: Date, culture: any, loc: any) => loc.format(date, 'eee', culture),
            dayHeaderFormat: (date: Date, culture: any, loc: any) => loc.format(date, 'EEEE', culture),
          }}
          messages={{
            next: "Próximo", previous: "Anterior", today: "Hoje",
            month: "Mês", week: "Semana", day: "Dia",
            date: "Data", time: "Hora", event: "Evento",
            noEventsInRange: "Não há eventos neste período.",
          }}
          components={components}
          step={30}
          timeslots={2}
          min={new Date(new Date().setHours(8, 0, 0, 0))}
          max={new Date(new Date().setHours(20, 0, 0, 0))}
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedEvent ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label>Nome do Cliente</label>
                  <input className="form-control" list="crm-leads" value={formData.patientName}
                    onChange={e => {
                      const name = e.target.value;
                      const lead = leads.find((l: Lead) => l.name === name);
                      setFormData({ ...formData, patientName: name, whatsapp: lead ? lead.phone : formData.whatsapp });
                    }} required />
                  <datalist id="crm-leads">
                    {leads.map((lead: Lead) => <option key={lead.id} value={lead.name} />)}
                  </datalist>
                </div>
                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label>WhatsApp</label>
                  <input className="form-control" value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label>Procedimento</label>
                  <select className="form-control" value={formData.procedure}
                    onChange={e => {
                      const procName = e.target.value;
                      const proc = procedures.find(p => p.name === procName);
                      if (proc) {
                        setFormData({ ...formData, procedure: procName, end: addMinutes(new Date(formData.start), proc.durationMinutes) });
                      } else {
                        setFormData({ ...formData, procedure: procName });
                      }
                    }} required>
                    <option value="">Selecione...</option>
                    {procedures.map(p => <option key={p.id} value={p.name}>{p.name} ({p.durationMinutes} min)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Horário Início</label>
                  <input type="time" className="form-control" value={format(formData.start, 'HH:mm')}
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const d = new Date(formData.start); d.setHours(+h, +m);
                      setFormData({ ...formData, start: d });
                    }} required />
                </div>
                <div className="form-group">
                  <label>Horário Fim</label>
                  <input type="time" className="form-control" value={format(formData.end, 'HH:mm')}
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const d = new Date(formData.end); d.setHours(+h, +m);
                      setFormData({ ...formData, end: d });
                    }} required />
                </div>
                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label>Valor</label>
                  <input className="form-control" value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="R$ 0,00" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
                {selectedEvent && (
                  <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ background: '#ff4d4f', color: '#fff' }}>
                    Excluir Agendamento
                  </button>
                )}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', gap: '12px', marginLeft: 'auto', width: isMobile ? '100%' : 'auto' }}>
                  <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: '#eee', color: '#333' }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#25d366', color: '#fff', borderColor: '#25d366', width: isMobile ? '100%' : 'auto' }}>
                    {selectedEvent ? 'Salvar Alterações' : 'Criar Agendamento'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
