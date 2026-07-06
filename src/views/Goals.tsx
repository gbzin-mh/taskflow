import { useStore } from '../store/useStore';

export default function Goals() {
  const { goals, openGoalModal, updateGoal, deleteGoal, showToast } = useStore();

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Metas</h2>
        <button className="btn btn-primary" onClick={() => openGoalModal()}>
          <i className="ti ti-plus" aria-hidden="true" />Nova meta
        </button>
      </div>

      {!goals.length ? (
        <div className="empty">
          <i className="ti ti-target" aria-hidden="true" />
          <p>Nenhuma meta definida ainda.</p>
        </div>
      ) : (
        goals.map(g => (
          <div key={g.id} className="goal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{g.title}</h3>
                {g.desc && <p style={{ fontSize: 12, color: 'var(--text3)' }}>{g.desc}</p>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="btn-icon"
                  onClick={() => openGoalModal(g)}
                  aria-label={`Editar meta: ${g.title}`}
                >
                  <i className="ti ti-edit" aria-hidden="true" />
                </button>
                <button
                  className="btn-icon"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => { deleteGoal(g.id); showToast('Meta excluída'); }}
                  aria-label={`Excluir meta: ${g.title}`}
                >
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={g.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${g.title}: ${g.progress}% concluído`}
            >
              <div className="progress-fill" style={{ width: `${Math.min(g.progress, 100)}%` }} />
            </div>

            <div className="goal-meta">
              <span>Progresso</span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{g.progress}%</span>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)' }}>Ajustar progresso</label>
              <input
                type="range" min={0} max={100} step={1}
                value={g.progress}
                style={{ marginTop: 4 }}
                aria-label={`Progresso de ${g.title}`}
                onChange={e => updateGoal(g.id, { progress: parseInt(e.target.value) })}
              />
            </div>
          </div>
        ))
      )}
    </>
  );
}
