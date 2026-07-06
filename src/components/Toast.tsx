import { useStore } from '../store/useStore';

export default function Toast() {
  const toast = useStore(s => s.toast);
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <i className="ti ti-check" aria-hidden="true" />
      {toast}
    </div>
  );
}
