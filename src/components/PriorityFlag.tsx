interface Props { priority: string }

const MAP: Record<string, { icon: string; cls: string; label: string }> = {
  high:   { icon: 'ti-flag-filled', cls: 'flag-high',   label: 'Alta'  },
  medium: { icon: 'ti-flag-filled', cls: 'flag-medium', label: 'Média' },
  low:    { icon: 'ti-flag',        cls: 'flag-low',    label: 'Baixa' },
};

export default function PriorityFlag({ priority }: Props) {
  const f = MAP[priority] ?? MAP.low;
  return (
    <span className={`priority-flag ${f.cls}`}>
      <i className={`ti ${f.icon}`} aria-hidden="true" />
      {f.label}
    </span>
  );
}
