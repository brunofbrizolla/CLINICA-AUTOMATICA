import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RagProvider } from './store/RagContext';
import { CrmProvider } from './store/CrmContext';
import { AgendaProvider } from './store/AgendaContext';
import { ProcedureProvider } from './store/ProcedureContext';
import { MainLayout } from './components/layout/MainLayout';
import { Chat } from './pages/Chat';
import { Agenda } from './pages/Agenda';
import { AdminRAG } from './pages/AdminRAG';
import { CRM } from './pages/CRM';
import { Procedures } from './pages/Procedures';

function App() {
  return (
    <RagProvider>
      <CrmProvider>
        <AgendaProvider>
          <ProcedureProvider>
            <div className="app-wrapper">
              <Router>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Chat />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/procedures" element={<Procedures />} />
                    <Route path="/admin" element={<AdminRAG />} />
                  </Routes>
                </MainLayout>
              </Router>
            </div>
          </ProcedureProvider>
        </AgendaProvider>
      </CrmProvider>
    </RagProvider>
  );
}

export default App;
