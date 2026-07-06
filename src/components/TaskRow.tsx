import { useStore } from '../store/useStore';
import { statusLabel, formatDate, getTagStyle } from '../utils/helpers';
import PriorityFlag from './PriorityFlag';
import type { Task } from '../types';

interface Props { task: Task }

export default function TaskRow({ task }: Props) {
  const { openTaskModal, updateTask, deleteTask, showToast } = useStore();
  const isDone      = task.status === 'done';
  const isCancelled = task.status === 'cancelled';
  const isOverdue   = !isDone && !isCancelled && !!task.due && new Date(task.due + 'T00:00:00') < new Date();

  function toggleStatus(e: React.MouseEvent) {
    e.stopPropagation();
    const newStatus = isDone ? 'todo' : 'done';
    updateTask(task.id, { status: newStatus });
    showToast(newStatus === 'done' ? 'Tarefa concluída!' : 'Tarefa reaberta');
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    deleteTask(task.id);
    showToast('Tarefa excluída');
  }

  return (
    <div
      className={`task-row${isDone ? ' done-row' : ''}${isCancelled ? ' cancelled-row' : ''}`}
      onClick={() => openTaskModal(task)}
      onKeyDown={e => { if (e.key === 'Enter') openTaskModal(task); }}
      tabIndex={0}
      role="button"
      aria-label={`${task.title} — ${statusLabel(task.status)}`}
    >
      <div className="task-row-status">
        <button
          className={`status-btn status-${task.status}`}
          title={statusLabel(task.status)}
          aria-label={`${statusLabel(task.status)} — clique para concluir`}
          onClick={toggleStatus}
        >
          {isDone && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} aria-hidden="true" />}
        </button>
      </div>

      <div className="task-row-name">
        <span className={`task-row-title${isDone || isCancelled ? ' crossed' : ''}`}>{task.title}</span>
        {task.desc && <span className="task-row-desc">{task.desc}</span>}
      </div>

      <div className="task-row-tags">
        {(task.tags ?? []).map(tag => {
          const s = getTagStyle(tag);
          return <span key={tag} className="tag" style={{ background: s.bg, color: s.color }}>{tag}</span>;
        })}
      </div>

      <div className={`task-row-due${isOverdue ? ' overdue' : ''}`}>
        {task.due
          ? <><i className="ti ti-calendar" aria-hidden="true" />{formatDate(task.due)}</>
          : <span style={{ color: 'var(--border2)' }}>—</span>}
      </div>

      <div className="task-row-priority">
        <PriorityFlag priority={task.priority} />
      </div>

      <div className="task-row-actions">
        <button className="btn-icon" aria-label={`Editar: ${task.title}`} onClick={e => { e.stopPropagation(); openTaskModal(task); }}>
          <i className="ti ti-edit" aria-hidden="true" />
        </button>
        <button className="btn-icon" style={{ color: 'var(--danger)' }} aria-label={`Excluir: ${task.title}`} onClick={handleDelete}>
          <i className="ti ti-trash" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
