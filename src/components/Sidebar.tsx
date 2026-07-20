import { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const { tasks, goals, openTaskModal } = useStore();
  const spaces = useStore(s => s.spaces);
  const lists = useStore(s => s.lists);
  const store = useStore() as any;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeListId = searchParams.get('list');

  const [expandedSpaces, setExpandedSpaces] = useState<Set<number>>(new Set());

  const toggleSpace = (id: number) => {
    setExpandedSpaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSpace = (space: { id: number; name: string }) => {
    const listCount = lists.filter(l => l.spaceId === space.id).length;
    const warning = listCount > 0
      ? `Excluir o espaço "${space.name}"? Isso também excluirá ${listCount} lista(s) e todas as tarefas associadas a elas.`
      : `Excluir o espaço "${space.name}"?`;
    if (window.confirm(warning)) {
      store.deleteSpace?.(space.id);
    }
  };

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

      <div className="nav-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 12 }}>
        <span aria-hidden="true">Espaços</span>
        <button
          className="btn-icon"
          onClick={() => store.openSpaceModal?.()}
          title="Criar novo espaço"
          aria-label="Criar novo espaço"
        >
          <i className="ti ti-plus" aria-hidden="true" />
        </button>
      </div>

      {spaces.map(space => {
        const isExpanded = expandedSpaces.has(space.id);
        const spaceLists = lists.filter(l => l.spaceId === space.id);

        return (
          <div key={space.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className="nav-item"
                style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => toggleSpace(space.id)}
                title={space.name}
              >
                <span style={{ width: 14, height: 14, borderRadius: 4, background: space.color, flexShrink: 0 }} aria-hidden="true" />
                <i className={space.icon} aria-hidden="true" />
                <span>{space.name}</span>
                <i
                  className={'ti ' + (isExpanded ? 'ti-chevron-down' : 'ti-chevron-right')}
                  style={{ marginLeft: 'auto' }}
                  aria-hidden="true"
                />
              </button>
              <button
                className="btn-icon"
                style={{ marginRight: 8, flexShrink: 0 }}
                onClick={() => handleDeleteSpace(space)}
                title={`Excluir espaço "${space.name}"`}
                aria-label={`Excluir espaço ${space.name}`}
              >
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>

            {isExpanded && (
              <div style={{ paddingLeft: 20 }}>
                {spaceLists.map(list => {
                  const listTaskCount = tasks.filter(t => t.listId === list.id).length;
                  const isActive = activeListId === String(list.id);
                  return (
                    <button
                      key={list.id}
                      className={'nav-item' + (isActive ? ' active' : '')}
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => navigate(`/tasks?list=${list.id}`)}
                      title={list.name}
                    >
                      <i className={list.icon} aria-hidden="true" />
                      <span>{list.name}</span>
                      {listTaskCount > 0 && (
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>{listTaskCount}</span>
                      )}
                    </button>
                  );
                })}

                <button
                  className="nav-item"
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}
                  onClick={() => store.openListModal?.(space.id)}
                  title="Criar nova lista"
                >
                  <i className="ti ti-plus" aria-hidden="true" />
                  <span>Nova lista</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

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
