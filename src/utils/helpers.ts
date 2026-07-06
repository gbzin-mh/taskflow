import type { Priority, Status } from '../types';

export const STATUS_CONFIG: Record<Status, { label: string; icon: string }> = {
  todo:      { label: 'Pendente',     icon: 'ti-circle-dashed'      },
  doing:     { label: 'Em andamento', icon: 'ti-progress'            },
  review:    { label: 'Em revisão',   icon: 'ti-eye'                 },
  done:      { label: 'Concluído',    icon: 'ti-circle-check-filled' },
  cancelled: { label: 'Cancelado',    icon: 'ti-circle-x'            },
};

export const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export function statusLabel(s: string): string {
  return STATUS_CONFIG[s as Status]?.label ?? s;
}

export function statusIcon(s: string): string {
  return STATUS_CONFIG[s as Status]?.icon ?? 'ti-circle';
}

export function priorityLabel(p: Priority | string): string {
  return p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa';
}

export function formatDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

const TAG_PALETTE = [
  { bg: '#eef2ff', color: '#4338ca' },
  { bg: '#f0fdf4', color: '#15803d' },
  { bg: '#fffbeb', color: '#b45309' },
  { bg: '#fdf2f8', color: '#a21caf' },
  { bg: '#eff6ff', color: '#1d4ed8' },
  { bg: '#faf5ff', color: '#7e22ce' },
  { bg: '#fff7ed', color: '#c2410c' },
  { bg: '#f0fdfa', color: '#0f766e' },
  { bg: '#fef2f2', color: '#b91c1c' },
  { bg: '#f8fafc', color: '#475569' },
];

const TAG_PALETTE_DARK = [
  { bg: '#312e81', color: '#c7d2fe' },
  { bg: '#14532d', color: '#bbf7d0' },
  { bg: '#78350f', color: '#fde68a' },
  { bg: '#831843', color: '#fbcfe8' },
  { bg: '#1e3a8a', color: '#bfdbfe' },
  { bg: '#4a1d96', color: '#e9d5ff' },
  { bg: '#7c2d12', color: '#fed7aa' },
  { bg: '#134e4a', color: '#99f6e4' },
  { bg: '#7f1d1d', color: '#fecaca' },
  { bg: '#1e293b', color: '#94a3b8' },
];

export function getTagStyle(tag: string): { bg: string; color: string } {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % TAG_PALETTE.length;
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return dark ? TAG_PALETTE_DARK[idx] : TAG_PALETTE[idx];
}

export function nextId(): number {
  return Date.now();
}
