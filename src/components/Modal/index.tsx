import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import TaskModal from './TaskModal';
import GoalModal from './GoalModal';

export default function Modal() {
  const { modal, closeModal } = useStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        const el = overlayRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);

  if (!modal) return null;

  return (
    <div
      ref={overlayRef}
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === overlayRef.current) closeModal(); }}
    >
      {modal === 'task' && <TaskModal />}
      {modal === 'goal' && <GoalModal />}
    </div>
  );
}
