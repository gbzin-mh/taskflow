import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { AgentService, agentMarkdown } from '../services/agentService';
import { statusLabel, priorityLabel, formatDate } from '../utils/helpers';
import type { AgentAction, AgentMessage } from '../types';

// ── Action card ───────────────────────────────────────────────────────────────
function ActionCard({ action, msgId, actionIdx }: { action: AgentAction; msgId: number; actionIdx: number }) {
  const { agentMessages, resolveAgentAction, createTask, updateTask, deleteTask, createGoal, updateGoal, showToast, getTaskById, getGoalById } = useStore();

  const msg = agentMessages.find(m => m.id === msgId);
  const aState = msg?.actionStates?.[actionIdx] ?? 'pending';

  const META: Record<string, { icon: string; label: string }> = {
    createTask:         { icon: 'ti-plus',     label: 'Criar tarefa' },
    updateTask:         { icon: 'ti-edit',      label: 'Atualizar tarefa' },
    deleteTask:         { icon: 'ti-trash',     label: 'Excluir tarefa' },
    createGoal:         { icon: 'ti-target',    label: 'Criar meta' },
    updateGoalProgress: { icon: 'ti-chart-bar', label: 'Atualizar progresso' },
  };
  const meta = META[action.action] ?? { icon: 'ti-bolt', label: action.action };

  const details: [string, string][] = [];
  if (action.id != null) {
    const t = getTaskById(Number(action.id));
    const g = getGoalById(Number(action.id));
    details.push(['Item', t?.title ?? g?.title ?? `#${action.id}`]);
  }
  if (action.title)             details.push(['Título',     action.title]);
  if (action.status)            details.push(['Status',     statusLabel(action.status)]);
  if (action.priority)          details.push(['Prioridade', priorityLabel(action.priority)]);
  if (action.due)               details.push(['Vencimento', formatDate(action.due)]);
  if (action.tags?.length)      details.push(['Tags',       action.tags.join(', ')]);
  if (action.progress != null)  details.push(['Progresso',  `${action.progress}%`]);

  function execute() {
    const result = AgentService.executeAction(action, { createTask, updateTask, deleteTask, createGoal, updateGoal });
    resolveAgentAction(msgId, actionIdx, 'executed');
    showToast(result);
  }

  return (
    <div className="agent-action-card">
      <div className="action-card-top">
        <span className="action-card-label">
          <i className={`ti ${meta.icon}`} aria-hidden="true" />{meta.label}
        </span>
        {aState === 'executed' && (
          <span className="action-badge executed"><i className="ti ti-check" aria-hidden="true" />Executado</span>
        )}
        {aState === 'ignored' && (
          <span className="action-badge ignored">Ignorado</span>
        )}
      </div>

      {details.length > 0 && (
        <div className="action-details">
          {details.map(([k, v]) => (
            <><span key={k} className="action-detail-key">{k}:</span><span className="action-detail-val">{v}</span></>
          ))}
        </div>
      )}

      {aState === 'pending' && (
        <div className="action-card-btns">
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={execute}>
            <i className="ti ti-check" aria-hidden="true" />Executar
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => resolveAgentAction(msgId, actionIdx, 'ignored')}>
            Ignorar
          </button>
        </div>
      )}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: AgentMessage }) {
  const isUser = msg.role === 'user';
  const displayText = isUser ? msg.content : AgentService.stripActionBlocks(msg.content);

  return (
    <div className={`agent-msg-row${isUser ? ' user-row' : ''}`}>
      {!isUser && (
        <div className="agent-avatar assistant-avatar">
          <i className="ti ti-sparkles" aria-hidden="true" />
        </div>
      )}
      <div className={`agent-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <div dangerouslySetInnerHTML={{ __html: agentMarkdown(displayText) }} />
        {!isUser && msg.actions?.map((action, i) => (
          <ActionCard key={i} action={action} msgId={msg.id} actionIdx={i} />
        ))}
      </div>
      {isUser && (
        <div className="agent-avatar user-avatar">
          <i className="ti ti-user" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function Agent() {
  const { tasks, goals, agentMessages, agentLoading, pushAgentMessage, setAgentLoading, clearAgentMessages } = useStore();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [agentMessages, agentLoading]);

  useEffect(() => {
    if (!agentLoading) textareaRef.current?.focus();
  }, [agentLoading]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  async function send(text: string) {
    if (!text.trim() || agentLoading) return;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    const userMsg: AgentMessage = { id: Date.now(), role: 'user', content: text };
    pushAgentMessage(userMsg);
    setAgentLoading(true);

    try {
      const allMessages = [...agentMessages, userMsg];
      const raw = await AgentService.send(allMessages, tasks, goals);
      const actions = AgentService.parseActions(raw);
      pushAgentMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: raw,
        actions,
        actionStates: actions.map(() => 'pending'),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pushAgentMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: `**Erro ao conectar com o assistente:** ${msg}\n\nTente novamente em instantes.`,
        actions: [],
        actionStates: [],
      });
    } finally {
      setAgentLoading(false);
    }
  }

  const SUGGESTIONS = [
    'Quais tarefas estão atrasadas?',
    'Crie uma tarefa de revisão de código',
    'Como estão minhas metas?',
    'Organize meu backlog por prioridade',
  ];

  return (
    <div className="agent-container">
      {/* Header */}
      <div className="agent-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="ti ti-sparkles" style={{ color: 'var(--accent)', fontSize: 20 }} aria-hidden="true" />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Assistente IA</span>
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--accent-bg)', color: 'var(--accent-text)', padding: '2px 8px', borderRadius: 20 }}>Beta</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 13 }}
            title="Limpar conversa"
            disabled={!agentMessages.length}
            onClick={() => { if (confirm('Limpar toda a conversa?')) clearAgentMessages(); }}
          >
            <i className="ti ti-eraser" aria-hidden="true" />Limpar
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="agent-messages" aria-live="polite" aria-label="Conversa com o assistente">
        {!agentMessages.length && (
          <div className="agent-welcome">
            <i className="ti ti-sparkles" style={{ fontSize: 42, color: 'var(--accent)' }} aria-hidden="true" />
            <p style={{ fontSize: 16, fontWeight: 600, marginTop: 14, marginBottom: 6 }}>Olá! Sou seu assistente TaskFlow.</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 340, textAlign: 'center', lineHeight: 1.6 }}>
              Posso criar tarefas, analisar prioridades, acompanhar metas e muito mais.
            </p>
            <div className="agent-suggestions">
              {SUGGESTIONS.map(q => (
                <button key={q} className="agent-suggestion" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {agentMessages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

        {agentLoading && (
          <div className="agent-msg-row">
            <div className="agent-avatar assistant-avatar">
              <i className="ti ti-sparkles" aria-hidden="true" />
            </div>
            <div className="agent-bubble assistant-bubble">
              <div className="agent-typing"><span /><span /><span /></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="agent-input-area">
        <textarea
          ref={textareaRef}
          className="agent-textarea"
          placeholder="Pergunte algo ou peça para criar tarefas… (Enter = enviar, Shift+Enter = nova linha)"
          aria-label="Mensagem para o assistente"
          rows={1}
          value={input}
          disabled={agentLoading}
          onChange={e => { setInput(e.target.value); autoResize(); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
        />
        <button
          className="btn btn-primary agent-send-btn"
          aria-label="Enviar mensagem"
          disabled={agentLoading || !input.trim()}
          onClick={() => send(input)}
        >
          <i className="ti ti-send" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
