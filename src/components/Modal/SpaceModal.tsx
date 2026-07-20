import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

const COLORS = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#64748b',
];

export default function SpaceModal() {
  const { spaceToEdit, closeModal, createSpace, updateSpace, showToast } = useStore();

  const [name,  setName]  = useState(spaceToEdit?.name  ?? '');
  const [color, setColor] = useState(spaceToEdit?.color ?? COLORS[0]);

  useEffect(() => {
    setTimeout(() => (document.getElementById('space-name') as HTMLInputElement)?.focus(), 50);
  }, []);

  function save() {
    if (!name.trim()) { alert('O nome é obrigatório.'); return; }
    if (spaceToEdit) {
      updateSpace(spaceToEdit.id, { name: name.trim(), color });
      showToast('Espaço atualizado!');
    } else {
      createSpace({ name: name.trim(), color, icon: 'ti ti-folder' });
      showToast('Espaço criado!');
    }
    closeModal();
  }

  return (
    <div className="modal" role="document">
      <div className="modal-header">
        <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 600 }}>
          {spaceToEdit ? 'Editar espaço' : 'Novo espaço'}
        </h2>
        <button className="btn-icon" onClick={closeModal} aria-label="Fechar modal">
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="space-name">Nome do espaço</label>
        <input
          id="space-name" type="text" value={name} required aria-required="true"
          placeholder="Ex: Projetos pessoais"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
        />
      </div>

      <div className="form-group">
        <label>Cor</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Selecionar cor do espaço">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Cor ${c}`}
              aria-pressed={color === c}
              style={{
                width: 28, height: 28, borderRadius: 6, background: c,
                border: color === c ? '2px solid var(--text)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>
          <i className="ti ti-device-floppy" aria-hidden="true" />Salvar espaço
        </button>
      </div>
    </div>
  );
}
