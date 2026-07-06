import type { AgentMessage, AgentAction, Task, Goal } from '../types';
import { statusLabel, priorityLabel, formatDate } from '../utils/helpers';

export const AgentService = {
  buildSystemPrompt(tasks: Task[], goals: Goal[]): string {
    const today = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const taskLines = tasks.length
      ? tasks.map(t =>
          `  • [id:${t.id}] "${t.title}" | status:${t.status} | prioridade:${t.priority}` +
          (t.due        ? ` | vence:${t.due}` : '') +
          (t.tags?.length ? ` | tags:${t.tags.join(',')}` : '')
        ).join('\n')
      : '  (nenhuma tarefa)';

    const goalLines = goals.length
      ? goals.map(g => `  • [id:${g.id}] "${g.title}" | progresso:${g.progress}%`).join('\n')
      : '  (nenhuma meta)';

    return `Você é o Assistente do TaskFlow, integrado a um gerenciador pessoal de tarefas e metas.

Data de hoje: ${today}

## Estado atual

Tarefas (${tasks.length}):
${taskLines}

Metas (${goals.length}):
${goalLines}

## Como propor ações

Para criar ou modificar itens, inclua ao final da resposta blocos de ação:

\`\`\`taskflow-action
{"action":"createTask","title":"...","status":"todo","priority":"medium","due":"","tags":[],"desc":""}
\`\`\`

Ações disponíveis:
- createTask: title*, status (todo/doing/review/done/cancelled), priority (low/medium/high), due (YYYY-MM-DD), tags[], desc
- updateTask: id* + quaisquer campos acima
- deleteTask: id*
- createGoal: title*, desc, progress (0–100)
- updateGoalProgress: id*, progress (0–100)

Use apenas IDs listados acima. Múltiplos blocos são permitidos.

## Regras
- Responda em português brasileiro
- Seja conciso e prático
- Foque em produtividade
- Nunca invente IDs`;
  },

  parseActions(text: string): AgentAction[] {
    const re = /```taskflow-action\s*([\s\S]*?)```/g;
    const result: AgentAction[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      try { result.push(JSON.parse(m[1].trim()) as AgentAction); } catch {}
    }
    return result;
  },

  stripActionBlocks(text: string): string {
    return text.replace(/```taskflow-action[\s\S]*?```/g, '').trim();
  },

  executeAction(
    action: AgentAction,
    ops: {
      createTask: (d: Omit<Task, 'id' | 'createdAt'>) => Task;
      updateTask: (id: number, d: Partial<Task>) => void;
      deleteTask: (id: number) => void;
      createGoal: (d: Omit<Goal, 'id'>) => Goal;
      updateGoal: (id: number, d: Partial<Goal>) => void;
    }
  ): string {
    const id = action.id != null ? Number(action.id) : 0;
    const { action: _a, id: _id, ...rest } = action as unknown as Record<string, unknown>;
    switch (action.action) {
      case 'createTask':         ops.createTask(rest as unknown as Omit<Task, 'id' | 'createdAt'>);  return `Tarefa "${action.title}" criada!`;
      case 'updateTask':         ops.updateTask(id, rest as Partial<Task>);                          return 'Tarefa atualizada!';
      case 'deleteTask':         ops.deleteTask(id);                                                 return 'Tarefa excluída!';
      case 'createGoal':         ops.createGoal(rest as unknown as Omit<Goal, 'id'>);                return `Meta "${action.title}" criada!`;
      case 'updateGoalProgress': ops.updateGoal(id, { progress: Number(action.progress) });       return `Progresso atualizado para ${action.progress}%!`;
      default:                   return `Ação desconhecida: "${action.action}"`;
    }
  },

  async send(messages: AgentMessage[], tasks: Task[], goals: Goal[]): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: this.buildSystemPrompt(tasks, goals),
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error ?? `Erro HTTP ${res.status}`);
    }
    const data = await res.json() as { text: string };
    return data.text ?? '';
  },
};

// Simple markdown → safe HTML (used in Agent view)
export function agentMarkdown(raw: string): string {
  const esc = raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return esc
    .replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:8px;margin-bottom:2px">$1</strong>')
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^\n*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code style="background:var(--surface2);padding:1px 5px;border-radius:3px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/^[-•]\s(.+)$/gm, '<span style="display:block;padding-left:12px">• $1</span>')
    .replace(/\n\n+/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// Re-export for convenience in Agent view
export { statusLabel, priorityLabel, formatDate };
