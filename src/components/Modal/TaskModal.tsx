import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTagStyle } from '../../utils/helpers';
import type { Status, Priority } from '../../types';

export default function TaskModal() {
  const { taskToEdit, taskPrefill, closeModal, createTask, updateTask, showToast } = useStore();
  const lists = useStore(s => s.lists);
  const spaces = useStore(s => s.spaces);

  const [title,    setTitle]    = useState(taskToEdit?.title    ?? '');
  const [status,   setStatus]   = useState<Status>(taskToEdit?.status   ?? (taskPrefill.status   ?? 'todo'));
  const [priority, setPriority] = useState<Priority>(taskToEdit?.priority ?? (taskPrefill.priority ?? 'medium'));
  const [due,      setDue]      = useState(taskToEdit?.due      ?? (taskPrefill.due  ?? ''));
  const [desc,     setDesc]     = useState(taskToEdit?.desc     ?? (taskPrefill.desc ?? ''));
  const [tagInput, setTagInput] = useState((taskToEdit?.tags ?? taskPrefill.tags ?? []).join(', '));
  const [listId,   setListId]   = useState(taskToEdit?.listId != null ? String(taskToEdit.listId) : '');

  const tags = tagInput.split(',').map(s => s.trim()).filter(Boolean);

  useEffect(() => {
    setTimeout(() => (document.getElementById('task-title') as HTMLInputElement)?.focus(), 50);
  }, []);

  function save() {
    if (!title.trim()) { alert('O título é obrigatório.'); return; }
    const data = { title: title.trim(), status, priority, due, desc, tags, listId: listId ? Number(listId) : undefined };
    if (taskToEdit) {
      updateTask(taskToEdit.id, data);
      showToast('Tarefa atualizada!');
    } else {
      createTask(data);
      showToast('Tarefa criada!');
    }
    closeModal();
  }

  return (
    <div className="modal" role="document">
      <div className="modal-header">
        <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 600 }}>
          {taskToEdit ? 'Editar tarefa' : 'Nova tarefa'}
        </h2>
        <button className="btn-icon" onClick={closeModal} aria-label="Fechar modal">
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="task-title">Título</label>
        <input
          id="task-title" type="text" value={title} required aria-required="true"
          placeholder="Nome da tarefa…"
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" value={status} onChange={e => setStatus(e.target.value as Status)}>
            <option value="todo">Pendente</option>
            <option value="doing">Em andamento</option>
            <option value="review">Em revisão</option>
            <option value="done">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="task-priority">Prioridade</label>
          <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="task-due">Data de conclusão</label>
          <input id="task-due" type="date" value={due} onChange={e => setDue(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="task-tags">
            Tags <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(separadas por vírgula)</span>
          </label>
          <input
            id="task-tags" type="text" value={tagInput}
            placeholder="ex: design, bug, urgente"
            onChange={e => setTagInput(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="task-list">Lista</label>
        <select id="task-list" value={listId} onChange={e => setListId(e.target.value)}>
          <option value="">Nenhuma</option>
          {spaces.map(space => (
            <optgroup key={space.id} label={space.name}>
              {lists.filter(list => list.spaceId === space.id).map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '-8px 0 12px' }}>
          {tags.map(tag => {
            const s = getTagStyle(tag);
            return <span key={tag} className="tag" style={{ background: s.bg, color: s.color }}>{tag}</span>;
          })}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="task-desc">Descrição</label>
        <textarea
          id="task-desc" rows={3} placeholder="Detalhes opcionais…"
          value={desc} onChange={e => setDesc(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>
          <i className="ti ti-device-floppy" aria-hidden="true" />Salvar tarefa
        </button>
      </div>
    </div>
  );
}
