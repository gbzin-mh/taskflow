import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const { tasks, goals, openTaskModal } = useStore();

  const activeTasks  = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
  const overdueTasks = tasks.filter(t =>
    t.due && t.status !== 'done' && t.status !== 'cancelled' &&
    new Date(t.due + 'T00:00:00') < new Date()
  ).length;

  return (
    <nav className="sidebar" aria-label="Navegação principal">
      <div className="sidebar-logo">
        <i className="ti ti-layout-kanban" aria-hidden="true" />
        <span>TaskFlow</span>
      </div>

      <span className="nav-section" aria-hidden="true">Visão geral</span>

      <NavLink to="/dashboard" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')} title="Dashboard">
        <i className="ti ti-home" aria-hidden="true" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/tasks" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')} title="Lista de tarefas">
        <i className="ti ti-list" aria-hidden="true" />
        <span>Tarefas</span>
        {activeTasks > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
            {activeTasks}
          </span>
        )}
      </NavLink>

      <span className="nav-section" aria-hidden="true">Visualizações</span>

      <NavLink to="/kanban" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')} title="Quadro Kanban">
        <i className="ti ti-layout-columns" aria-hidden="true" />
        <span>Kanban</span>
      </NavLink>

      <NavLink to="/calendar" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')} title="Calendário de vencimentos">
        <i className="ti ti-calendar" aria-hidden="true" />
        <span>Calendário</span>
        {overdueTasks > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }} title={`${overdueTasks} tarefa(s) atrasada(s)`}>
            {overdueTasks}
          </span>
        )}
      </NavLink>

      <span className="nav-section" aria-hidden="true">Progresso</span>

      <NavLink to="/goals" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')} title="Metas e objetivos">
        <i className="ti ti-target" aria-hidden="true" />
        <span>Metas</span>
        {goals.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>{goals.length}</span>
        )}
      </NavLink>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
          onClick={() => openTaskModal()}
          title="Criar nova tarefa"
        >
          <i className="ti ti-plus" aria-hidden="true" />Nova tarefa
        </button>
      </div>
    </nav>
  );
}
