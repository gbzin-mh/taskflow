import { create } from 'zustand';
import type { Task, Goal, ModalType } from '../types';

const STORAGE_KEY = 'taskflow_v3';

function persist(tasks: Task[], goals: Goal[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, goals })); } catch {}
}

const EMPTY_TASKS: Task[] = [];
const EMPTY_GOALS: Goal[] = [];

interface AppStore {
  // ── Data ────────────────────────────────────────────────────────────────────
  tasks: Task[];
  goals: Goal[];

  // ── Modal ────────────────────────────────────────────────────────────────────
  modal: ModalType;
  taskToEdit: Task | null;
  taskPrefill: Partial<Task>;
  goalToEdit: Goal | null;

  // ── UI ──────────────────────────────────────────────────────────────────────
  toast: string | null;
  _toastTimer: ReturnType<typeof setTimeout> | null;
  calMonth: number;
  calYear: number;
  collapsedGroups: Record<string, boolean>;

  // ── Actions ──────────────────────────────────────────────────────────────────
  loadState: () => void;

  createTask: (data: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: number, changes: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  getTaskById: (id: number) => Task | undefined;

  createGoal: (data: Omit<Goal, 'id'>) => Goal;
  updateGoal: (id: number, changes: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;
  getGoalById: (id: number) => Goal | undefined;

  openTaskModal: (task?: Task | null, prefill?: Partial<Task>) => void;
  openGoalModal: (goal?: Goal | null) => void;
  closeModal: () => void;

  showToast: (msg: string) => void;
  toggleGroup: (status: string) => void;
  setCalMonth: (month: number) => void;
  setCalYear: (year: number) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  tasks: [],
  goals: [],
  modal: null,
  taskToEdit: null,
  taskPrefill: {},
  goalToEdit: null,
  toast: null,
  _toastTimer: null,
  calMonth: new Date().getMonth(),
  calYear: new Date().getFullYear(),
  collapsedGroups: {},

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { tasks?: Task[]; goals?: Goal[] };
        const tasks: Task[] = (p.tasks ?? []).map(t => ({ ...t, tags: t.tags ?? [] }));
        const goals: Goal[] = p.goals ?? [];
        if (tasks.length || goals.length) { set({ tasks, goals }); return; }
      }
    } catch {}
    set({ tasks: EMPTY_TASKS, goals: EMPTY_GOALS });
  },

  // ── Tasks ──────────────────────────────────────────────────────────────────
  createTask(data) {
    const task: Task = { ...data, tags: data.tags ?? [], id: Date.now(), createdAt: new Date().toISOString() };
    const tasks = [...get().tasks, task];
    set({ tasks });
    persist(tasks, get().goals);
    return task;
  },
  updateTask(id, changes) {
    const tasks = get().tasks.map(t => t.id === id ? { ...t, ...changes } : t);
    set({ tasks });
    persist(tasks, get().goals);
  },
  deleteTask(id) {
    const tasks = get().tasks.filter(t => t.id !== id);
    set({ tasks });
    persist(tasks, get().goals);
  },
  getTaskById(id) { return get().tasks.find(t => t.id === id); },

  // ── Goals ──────────────────────────────────────────────────────────────────
  createGoal(data) {
    const goal: Goal = { ...data, desc: data.desc ?? '', progress: data.progress ?? 0, id: Date.now() };
    const goals = [...get().goals, goal];
    set({ goals });
    persist(get().tasks, goals);
    return goal;
  },
  updateGoal(id, changes) {
    const goals = get().goals.map(g => g.id === id ? { ...g, ...changes } : g);
    set({ goals });
    persist(get().tasks, goals);
  },
  deleteGoal(id) {
    const goals = get().goals.filter(g => g.id !== id);
    set({ goals });
    persist(get().tasks, goals);
  },
  getGoalById(id) { return get().goals.find(g => g.id === id); },

  // ── Modal ──────────────────────────────────────────────────────────────────
  openTaskModal(task = null, prefill = {}) {
    set({ modal: 'task', taskToEdit: task, taskPrefill: prefill });
  },
  openGoalModal(goal = null) {
    set({ modal: 'goal', goalToEdit: goal });
  },
  closeModal() {
    set({ modal: null, taskToEdit: null, taskPrefill: {}, goalToEdit: null });
  },

  // ── UI ──────────────────────────────────────────────────────────────────────
  showToast(msg) {
    const old = get()._toastTimer;
    if (old) clearTimeout(old);
    const timer = setTimeout(() => set({ toast: null, _toastTimer: null }), 2500);
    set({ toast: msg, _toastTimer: timer });
  },
  toggleGroup(status) {
    const collapsedGroups = { ...get().collapsedGroups, [status]: !get().collapsedGroups[status] };
    set({ collapsedGroups });
  },
  setCalMonth(month) { set({ calMonth: month }); },
  setCalYear(year)   { set({ calYear: year }); },
}));
