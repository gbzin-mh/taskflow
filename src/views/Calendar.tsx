import { useStore } from '../store/useStore';
import { MONTH_NAMES } from '../utils/helpers';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendar() {
  const { tasks, calMonth, calYear, setCalMonth, setCalYear } = useStore();

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  }

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);
  const today    = new Date();

  const paddingDays = firstDay.getDay();
  const cells: Array<{ day: number; isCurrentMonth: boolean }> = [];

  for (let i = 0; i < paddingDays; i++) {
    const prevDate = new Date(calYear, calMonth, 0 - paddingDays + 1 + i);
    cells.push({ day: prevDate.getDate(), isCurrentMonth: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Calendário</h2>
      </div>

      <div className="cal-nav" aria-label="Navegação do calendário">
        <button className="btn btn-ghost" onClick={prevMonth} aria-label="Mês anterior">
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
        <span className="cal-month" aria-live="polite">
          {MONTH_NAMES[calMonth]} {calYear}
        </span>
        <button className="btn btn-ghost" onClick={nextMonth} aria-label="Próximo mês">
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      </div>

      <div
        className="calendar-grid"
        role="grid"
        aria-label={`Calendário de ${MONTH_NAMES[calMonth]} ${calYear}`}
      >
        {WEEKDAYS.map(d => (
          <div key={d} className="cal-header" role="columnheader">{d}</div>
        ))}

        {cells.map((cell, i) => {
          if (!cell.isCurrentMonth) {
            return (
              <div key={`pad-${i}`} className="cal-day other-month" aria-hidden="true">
                <div className="cal-day-num">{cell.day}</div>
              </div>
            );
          }

          const isToday =
            cell.day === today.getDate() &&
            calMonth === today.getMonth() &&
            calYear === today.getFullYear();

          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
          const dayTasks = tasks.filter(t => t.due === dateStr);
          const label = `${cell.day} de ${MONTH_NAMES[calMonth]}${isToday ? ' (hoje)' : ''}${dayTasks.length ? `, ${dayTasks.length} tarefa(s)` : ''}`;

          return (
            <div
              key={cell.day}
              className={`cal-day${isToday ? ' today' : ''}`}
              role="gridcell"
              tabIndex={0}
              aria-label={label}
            >
              <div className="cal-day-num">{cell.day}</div>
              {dayTasks.map(t => (
                <div key={t.id} className="cal-event" title={t.title}>{t.title}</div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
