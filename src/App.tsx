import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Modal from './components/Modal';
import Dashboard from './views/Dashboard';
import TaskList from './views/TaskList';
import Kanban from './views/Kanban';
import Calendar from './views/Calendar';
import Goals from './views/Goals';

function MainLayout() {
  return (
    <main id="main-content" role="main" tabIndex={-1} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', minWidth: 0 }}>
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks"     element={<TaskList />} />
        <Route path="/kanban"    element={<Kanban />} />
        <Route path="/calendar"  element={<Calendar />} />
        <Route path="/goals"     element={<Goals />} />
      </Routes>
    </main>
  );
}

export default function App() {
  const loadState = useStore(s => s.loadState);

  useEffect(() => { loadState(); }, [loadState]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <MainLayout />
      <Modal />
      <Toast />
    </div>
  );
}
