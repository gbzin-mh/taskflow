import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import TaskRow from '../components/TaskRow';

export default function Dashboard() {
  const { tasks, goals, openTaskModal, openGoalModal } = useStore();
  const navigate = useNavigate();

  const todo      = tasks.filter(t => t.status === 'todo').length;
  const doing     = tasks.filter(t => t.status === 'doing').length;
  const review    = tasks.filter(t => t.status === 'review').length;
  const done      = tasks.filter(t => t.status === 'done').length;
  const cancelled = tasks.filter(t => t.status === 'cancelled').length;

  const recent = [...tasks].reverse().slice(0, 5);

  const STATS = [
    { num: tasks.length, label: 'Total',      color: 'var(--text)' },
    { num: todo,         label: 'Pendentes',  color: 'var(--text2)' },
    { num: doing,        label: 'Andamento',  color: 'var(--info)' },
    { num: review,       label: 'Em revisão', color: 'var(--warn)' },
    { num: done,         label: 'Concluídas', color: 'var(--success)' },
    { num: cancelled,    label: 'Canceladas', color: 'var(--danger)' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Stat bar */}
      <div className="stat-bar" role="list" aria-label="Resumo de tarefas">
        {STATS.map(({ num, label, color }) => (
          <div
            key={label}
            className="stat-bar-item"
            role="listitem"
            tabIndex={0}
            title={`Ver tarefas — ${label}`}
            aria-label={`${num} ${label}`}
            onClick={() => navigate('/tasks')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/tasks'); }}
          >
            <div className="stat-bar-num" style={{ color }}>{num}</div>
            <div className="stat-bar-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Tarefas recentes</h2>
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/tasks')}>Ver todas</button>
        </div>

        {!recent.length ? (
          <div className="empty" style={{ padding: '32px 0' }}>
            <i className="ti ti-clipboard" aria-hidden="true" />
            <p>Nenhuma tarefa criada ainda.</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => openTaskModal()}>
              <i className="ti ti-plus" aria-hidden="true" />Criar primeira tarefa
            </button>
          </div>
        ) : (
          <>
            <div className="task-col-headers" style={{ position: 'static' }}>
              <div className="task-col-hdr col-status" />
              <div className="task-col-hdr col-name">Nome</div>
              <div className="task-col-hdr col-tags">Tags</div>
              <div className="task-col-hdr col-due">Vencimento</div>
              <div className="task-col-hdr col-priority">Prioridade</div>
              <div className="task-col-hdr col-actions" />
            </div>
            {recent.map(t => <TaskRow key={t.id} task={t} />)}
          </>
        )}
      </div>

      {/* Goals */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Metas</h2>
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/goals')}>Ver metas</button>
        </div>

        {goals.length === 0 ? (
          <div className="goal-card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer' }} onClick={() => navigate('/goals')}>
            <i className="ti ti-target" style={{ fontSize: 32, color: 'var(--text3)', display: 'block', marginBottom: 8 }} aria-hidden="true" />
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 12 }}>Nenhuma meta definida ainda</p>
            <button className="btn btn-primary" onClick={e => { e.stopPropagation(); openGoalModal(); }}>
              <i className="ti ti-plus" aria-hidden="true" />Criar primeira meta
            </button>
          </div>
        ) : (
          goals.map(g => (
            <div
              key={g.id}
              className="goal-card"
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              title="Clique para gerenciar metas"
              onClick={() => navigate('/goals')}
              onKeyDown={e => { if (e.key === 'Enter') navigate('/goals'); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{g.title}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{g.progress}%</span>
              </div>
              <div className="progress-bar" role="progressbar" aria-valuenow={g.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${g.progress}%` }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{g.desc || 'Clique em "Ver metas" para ajustar o progresso'}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
