export type Status   = 'todo' | 'doing' | 'review' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';
export type ModalType   = 'task' | 'goal' | null;
export type View = 'dashboard' | 'tasks' | 'kanban' | 'calendar' | 'goals';

export interface Task {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  due: string;
  desc: string;
  tags: string[];
  createdAt?: string;
}

export interface Goal {
  id: number;
  title: string;
  desc: string;
  progress: number;
  target?: string;
}

