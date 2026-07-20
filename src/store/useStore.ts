import { create } from 'zustand';
import type { Task, Goal, ModalType, Space, List } from '../types';

const STORAGE_KEY = 'taskflow_v3';

function persist(tasks: Task[], goals: Goal[], spaces: Space[], lists: List[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, goals, spaces, lists })); } catch {}
}

const EMPTY_TASKS: Task[] = [];
const EMPTY_GOALS: Goal[] = [];
const EMPTY_SPACES: Space[] = [];
const EMPTY_LISTS: List[] = [];

interface AppStore {
  // ── Data ────────────────────────────────────────────────────────────────────
  tasks: Task[];
  goals: Goal[];
  spaces: Space[];
  lists: List[];

  // ── Modal ────────────────────────────────────────────────────────────────────
  modal: ModalType;
  taskToEdit: Task | null;
  taskPrefill: Partial<Task>;
  goalToEdit: Goal | null;
  spaceToEdit: Space | null;
  listToEdit: List | null;
  listSpaceId: number | null;

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

  createSpace: (data: Omit<Space, 'id'>) => Space;
  updateSpace: (id: number, changes: Partial<Space>) => void;
  deleteSpace: (id: number) => void;
  getSpaceById: (id: number) => Space | undefined;

  createList: (data: Omit<List, 'id'>) => List;
  updateList: (id: number, changes: Partial<List>) => void;
  deleteList: (id: number) => void;
  getListById: (id: number) => List | undefined;

  openTaskModal: (task?: Task | null, prefill?: Partial<Task>) => void;
  openGoalModal: (goal?: Goal | null) => void;
  openSpaceModal: (space?: Space | null) => void;
  openListModal: (spaceId: number, list?: List | null) => void;
  closeModal: () => void;

  showToast: (msg: string) => void;
  toggleGroup: (status: string) => void;
  setCalMonth: (month: number) => void;
  setCalYear: (year: number) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  tasks: [],
  goals: [],
  spaces: [],
  lists: [],
  modal: null,
  taskToEdit: null,
  taskPrefill: {},
  goalToEdit: null,
  spaceToEdit: null,
  listToEdit: null,
  listSpaceId: null,
  toast: null,
  _toastTimer: null,
  calMonth: new Date().getMonth(),
  calYear: new Date().getFullYear(),
  collapsedGroups: {},

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { tasks?: Task[]; goals?: Goal[]; spaces?: Space[]; lists?: List[] };
        const tasks: Task[] = (p.tasks ?? []).map(t => ({ ...t, tags: t.tags ?? [] }));
        const goals: Goal[] = p.goals ?? [];
        const spaces: Space[] = p.spaces ?? [];
        const lists: List[] = p.lists ?? [];
        // Detect previously persisted demo/seed data and avoid loading it for new visitors.
        const demoTaskTitles = ['Estudar WCAG 2.1', 'Criar protótipo do app'];
        const demoGoalTitles = ['Completar PDI semestral', 'Aprender acessibilidade web'];
        const isDemoTasks = tasks.length > 0 && tasks.every(t => demoTaskTitles.includes(t.title));
        const isDemoGoals = goals.length > 0 && goals.every(g => demoGoalTitles.includes(g.title));

        let loadTasks = tasks;
        let loadGoals = goals;
        if (isDemoTasks) loadTasks = [];
        if (isDemoGoals) loadGoals = [];

        // If we detected only demo data, clear it and persist the empty state
        if ((isDemoTasks || isDemoGoals)) {
          set({ tasks: loadTasks, goals: loadGoals, spaces, lists });
          try { persist(loadTasks, loadGoals, spaces, lists); } catch {}
          return;
        }

        if (loadTasks.length || loadGoals.length || spaces.length || lists.length) { set({ tasks: loadTasks, goals: loadGoals, spaces, lists }); return; }
      }
    } catch {}
    set({ tasks: EMPTY_TASKS, goals: EMPTY_GOALS, spaces: EMPTY_SPACES, lists: EMPTY_LISTS });
  },

  // ── Tasks ──────────────────────────────────────────────────────────────────
  createTask(data) {
    const task: Task = { ...data, tags: data.tags ?? [], id: Date.now(), createdAt: new Date().toISOString() };
    const tasks = [...get().tasks, task];
    set({ tasks });
    persist(tasks, get().goals, get().spaces, get().lists);
    return task;
  },
  updateTask(id, changes) {
    const tasks = get().tasks.map(t => t.id === id ? { ...t, ...changes } : t);
    set({ tasks });
    persist(tasks, get().goals, get().spaces, get().lists);
  },
  deleteTask(id) {
    const tasks = get().tasks.filter(t => t.id !== id);
    set({ tasks });
    persist(tasks, get().goals, get().spaces, get().lists);
  },
  getTaskById(id) { return get().tasks.find(t => t.id === id); },

  // ── Goals ──────────────────────────────────────────────────────────────────
  createGoal(data) {
    const goal: Goal = { ...data, desc: data.desc ?? '', progress: data.progress ?? 0, id: Date.now() };
    const goals = [...get().goals, goal];
    set({ goals });
    persist(get().tasks, goals, get().spaces, get().lists);
    return goal;
  },
  updateGoal(id, changes) {
    const goals = get().goals.map(g => g.id === id ? { ...g, ...changes } : g);
    set({ goals });
    persist(get().tasks, goals, get().spaces, get().lists);
  },
  deleteGoal(id) {
    const goals = get().goals.filter(g => g.id !== id);
    set({ goals });
    persist(get().tasks, goals, get().spaces, get().lists);
  },
  getGoalById(id) { return get().goals.find(g => g.id === id); },

  // ── Spaces ─────────────────────────────────────────────────────────────────
  createSpace(data) {
    const space: Space = { ...data, id: Date.now() };
    const spaces = [...get().spaces, space];
    set({ spaces });
    persist(get().tasks, get().goals, spaces, get().lists);
    return space;
  },
  updateSpace(id, changes) {
    const spaces = get().spaces.map(s => s.id === id ? { ...s, ...changes } : s);
    set({ spaces });
    persist(get().tasks, get().goals, spaces, get().lists);
  },
  deleteSpace(id) {
    const spaces = get().spaces.filter(s => s.id !== id);
    set({ spaces });
    persist(get().tasks, get().goals, spaces, get().lists);
  },
  getSpaceById(id) { return get().spaces.find(s => s.id === id); },

  // ── Lists ──────────────────────────────────────────────────────────────────
  createList(data) {
    const list: List = { ...data, id: Date.now() };
    const lists = [...get().lists, list];
    set({ lists });
    persist(get().tasks, get().goals, get().spaces, lists);
    return list;
  },
  updateList(id, changes) {
    const lists = get().lists.map(l => l.id === id ? { ...l, ...changes } : l);
    set({ lists });
    persist(get().tasks, get().goals, get().spaces, lists);
  },
  deleteList(id) {
    const lists = get().lists.filter(l => l.id !== id);
    set({ lists });
    persist(get().tasks, get().goals, get().spaces, lists);
  },
  getListById(id) { return get().lists.find(l => l.id === id); },

  // ── Modal ──────────────────────────────────────────────────────────────────
  openTaskModal(task = null, prefill = {}) {
    set({ modal: 'task', taskToEdit: task, taskPrefill: prefill });
  },
  openGoalModal(goal = null) {
    set({ modal: 'goal', goalToEdit: goal });
  },
  openSpaceModal(space = null) {
    set({ modal: 'space', spaceToEdit: space });
  },
  openListModal(spaceId, list = null) {
    set({ modal: 'list', listSpaceId: spaceId, listToEdit: list });
  },
  closeModal() {
    set({ modal: null, taskToEdit: null, taskPrefill: {}, goalToEdit: null, spaceToEdit: null, listToEdit: null, listSpaceId: null });
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
