import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

const ICONS = [
  'ti ti-list-check',
  'ti ti-cloud',
  'ti ti-shield-lock',
  'ti ti-server',
  'ti ti-code',
  'ti ti-checklist',
];

export default function ListModal() {
  const { listToEdit, listSpaceId, closeModal, createList, updateList, showToast, getSpaceById } = useStore();

  const [name, setName] = useState(listToEdit?.name ?? '');
  const [icon, setIcon] = useState(listToEdit?.icon ?? ICONS[0]);

  useEffect(() => {
    setTimeout(() => (document.getElementById('list-name') as HTMLInputElement)?.focus(), 50);
  }, []);

  function save() {
    if (!name.trim()) { alert('O nome é obrigatório.'); return; }
    if (listToEdit) {
      updateList(listToEdit.id, { name: name.trim(), icon });
      showToast('Lista atualizada!');
    } else {
      if (listSpaceId == null) { alert('Espaço inválido.'); return; }
      const spaceId = listSpaceId;
      const color = getSpaceById(spaceId)?.color ?? '#64748b';
      createList({ name: name.trim(), icon, spaceId, color });
      showToast('Lista criada!');
    }
    closeModal();
  }

  return (
    <div className="modal" role="document">
      <div className="modal-header">
        <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 600 }}>
          {listToEdit ? 'Editar lista' : 'Nova lista'}
        </h2>
        <button className="btn-icon" onClick={closeModal} aria-label="Fechar modal">
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="list-name">Nome da lista</label>
        <input
          id="list-name" type="text" value={name} required aria-required="true"
          placeholder="Ex: Backlog"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
        />
      </div>

      <div className="form-group">
        <label>Ícone</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Selecionar ícone da lista">
          {ICONS.map(i => (
            <button
              key={i}
              type="button"
              className="btn-icon"
              onClick={() => setIcon(i)}
              aria-label={i}
              aria-pressed={icon === i}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: icon === i ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              <i className={i} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>
          <i className="ti ti-device-floppy" aria-hidden="true" />Salvar lista
        </button>
      </div>
    </div>
  );
}
