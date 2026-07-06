import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/tasks',    icon: 'ti-list',           label: 'Lista'      },
  { to: '/kanban',   icon: 'ti-layout-columns', label: 'Quadro'     },
  { to: '/calendar', icon: 'ti-calendar',       label: 'Calendário' },
] as const;

export default function ViewTabs() {
  return (
    <div className="view-tabs">
      {TABS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => 'view-tab' + (isActive ? ' active' : '')}
        >
          <i className={`ti ${icon}`} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}
