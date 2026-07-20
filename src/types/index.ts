export type Status   = 'todo' | 'doing' | 'review' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';
export type ModalType   = 'task' | 'goal' | 'space' | 'list' | null;
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
  spaceId?: number;
  listId?: number;
}

export interface Goal {
  id: number;
  title: string;
  desc: string;
  progress: number;
  target?: string;
}

export interface Space {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface List {
  id: number;
  spaceId: number;
  name: string;
  icon: string;
  color: string;
}

