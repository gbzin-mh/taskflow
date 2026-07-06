import { useStore } from '../store/useStore';
import ViewTabs from '../components/ViewTabs';
import PriorityFlag from '../components/PriorityFlag';
import { formatDate, getTagStyle } from '../utils/helpers';
import type { Status } from '../types';

const COLUMNS: [Status, string][] = [
  ['todo',   'Pendente'],
  ['doing',  'Em andamento'],
  ['review', 'Em revisão'],
  ['done',   'Concluído'],
];

export default function Kanban() {
  const { tasks, openTaskModal, updateTask, showToast } = useStore();

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tarefas</h2>
        <button className="btn btn-primary" onClick={() => openTaskModal()}>
          <i className="ti ti-plus" aria-hidden="true" />Nova tarefa
        </button>
      </div>

      <ViewTabs />

      <div className="kanban" style={{ marginTop: 16 }} aria-label="Quadro Kanban">
        {COLUMNS.map(([status, label]) => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="kanban-col" aria-label={`Coluna: ${label}`}>
              <div className="kanban-col-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`task-group-dot status-dot-${status}`} />
                  <span className="kanban-col-title">{label}</span>
                </div>
                <span className="kanban-count" aria-label={`${colTasks.length} tarefas`}>{colTasks.length}</span>
              </div>

              {!colTasks.length && (
                <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>Nenhuma tarefa</p>
              )}

              {colTasks.map(t => {
                const tags = (t.tags ?? []);
                return (
                  <div
                    key={t.id}
                    className="task-card"
                    tabIndex={0}
                    role="button"
                    aria-label={`${t.title} — clique para editar`}
                    onClick={() => openTaskModal(t)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openTaskModal(t); }}
                  >
                    <div className="task-card-title">{t.title}</div>

                    {tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0 2px' }}>
                        {tags.map(tag => {
                          const s = getTagStyle(tag);
                          return <span key={tag} className="tag" style={{ background: s.bg, color: s.color }}>{tag}</span>;
                        })}
                      </div>
                    )}

                    <div className="task-card-meta" style={{ marginTop: 6 }}>
                      <PriorityFlag priority={t.priority} />
                      {t.due && (
                        <span className="task-card-date">
                          <i className="ti ti-calendar" style={{ fontSize: 11 }} aria-hidden="true" />
                          {formatDate(t.due)}
                        </span>
                      )}
                    </div>

                    <select
                      style={{ marginTop: 8, fontSize: 12, padding: '4px 8px', borderRadius: 6, width: '100%' }}
                      aria-label={`Mover "${t.title}" para`}
                      value={t.status}
                      onChange={e => {
                        updateTask(t.id, { status: e.target.value as Status });
                        showToast('Tarefa movida');
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {COLUMNS.map(([sv, sl]) => <option key={sv} value={sv}>{sl}</option>)}
                    </select>
                  </div>
                );
              })}

              <div
                className="task-add-row"
                style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', marginTop: 4, padding: '8px 4px' }}
                onClick={() => openTaskModal(null, { status })}
              >
                <i className="ti ti-plus" aria-hidden="true" />Adicionar tarefa
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
