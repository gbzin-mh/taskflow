import { useStore } from '../store/useStore';
import ViewTabs from '../components/ViewTabs';
import TaskRow from '../components/TaskRow';
import { statusLabel } from '../utils/helpers';
import type { Status } from '../types';

const GROUP_ORDER: Status[] = ['todo', 'doing', 'review', 'done', 'cancelled'];

export default function TaskList() {
  const { tasks, openTaskModal, toggleGroup, collapsedGroups } = useStore();

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tarefas</h2>
        <button className="btn btn-primary" onClick={() => openTaskModal()} aria-label="Criar nova tarefa">
          <i className="ti ti-plus" aria-hidden="true" />Nova tarefa
        </button>
      </div>

      <ViewTabs />

      {!tasks.length ? (
        <div className="empty">
          <i className="ti ti-clipboard-list" aria-hidden="true" />
          <p>Nenhuma tarefa ainda. Crie a primeira!</p>
        </div>
      ) : (
        <>
          <div className="task-col-headers">
            <div className="task-col-hdr col-status" />
            <div className="task-col-hdr col-name">Nome</div>
            <div className="task-col-hdr col-tags">Tags</div>
            <div className="task-col-hdr col-due">Vencimento</div>
            <div className="task-col-hdr col-priority">Prioridade</div>
            <div className="task-col-hdr col-actions" />
          </div>

          {GROUP_ORDER.map(status => {
            const group = tasks.filter(t => t.status === status);
            const collapsed = !!collapsedGroups[status];
            return (
              <div key={status} className="task-group">
                <div
                  className="task-group-hd"
                  role="button"
                  tabIndex={0}
                  aria-expanded={!collapsed}
                  onClick={() => toggleGroup(status)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(status); } }}
                >
                  <i className={`ti ti-chevron-right task-group-chevron${collapsed ? '' : ' open'}`} aria-hidden="true" />
                  <span className={`task-group-dot status-dot-${status}`} />
                  <span className="task-group-name">{statusLabel(status)}</span>
                  <span className="task-group-badge">{group.length}</span>
                </div>

                {!collapsed && (
                  <>
                    {group.length === 0
                      ? <p className="task-group-empty">Nenhuma tarefa neste status</p>
                      : group.map(t => <TaskRow key={t.id} task={t} />)
                    }
                    <div
                      className="task-add-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => openTaskModal(null, { status })}
                      onKeyDown={e => { if (e.key === 'Enter') openTaskModal(null, { status }); }}
                    >
                      <i className="ti ti-plus" aria-hidden="true" />Adicionar tarefa
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
