import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export default function GoalModal() {
  const { goalToEdit, closeModal, createGoal, updateGoal, showToast } = useStore();

  const [title,    setTitle]    = useState(goalToEdit?.title    ?? '');
  const [desc,     setDesc]     = useState(goalToEdit?.desc     ?? '');
  const [progress, setProgress] = useState(goalToEdit?.progress ?? 0);

  useEffect(() => {
    setTimeout(() => (document.getElementById('goal-title') as HTMLInputElement)?.focus(), 50);
  }, []);

  function save() {
    if (!title.trim()) { alert('O título é obrigatório.'); return; }
    if (goalToEdit) {
      updateGoal(goalToEdit.id, { title: title.trim(), desc, progress });
      showToast('Meta atualizada!');
    } else {
      createGoal({ title: title.trim(), desc, progress });
      showToast('Meta criada!');
    }
    closeModal();
  }

  return (
    <div className="modal" role="document">
      <div className="modal-header">
        <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 600 }}>
          {goalToEdit ? 'Editar meta' : 'Nova meta'}
        </h2>
        <button className="btn-icon" onClick={closeModal} aria-label="Fechar modal">
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="goal-title">Título da meta</label>
        <input
          id="goal-title" type="text" value={title} required aria-required="true"
          placeholder="Ex: Completar PDI"
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="goal-desc">Descrição</label>
        <textarea
          id="goal-desc" rows={2} placeholder="Descreva sua meta…"
          value={desc} onChange={e => setDesc(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="goal-progress">
          Progresso inicial: <strong>{progress}%</strong>
        </label>
        <input
          id="goal-progress" type="range" min={0} max={100} step={1}
          value={progress} aria-label="Progresso inicial da meta"
          onChange={e => setProgress(parseInt(e.target.value))}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>
          <i className="ti ti-device-floppy" aria-hidden="true" />Salvar meta
        </button>
      </div>
    </div>
  );
}
