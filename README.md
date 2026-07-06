# TaskFlow

Gerenciador pessoal de tarefas e metas com assistente de IA integrado (Claude/Anthropic), pronto para produção na Vercel.

## Arquitetura

SPA em React consumindo uma API serverless própria — a chave da Anthropic nunca chega ao navegador.

```
Usuário
  │
  ▼
React (SPA, HashRouter)
  │  fetch('/api/chat')
  ▼
Vercel Function (api/chat.ts, Node.js runtime)
  │  x-api-key: ANTHROPIC_API_KEY (variável de ambiente, só no servidor)
  ▼
Anthropic API (api.anthropic.com)
  │
  ▼
Resposta → Vercel Function → React
```

- O frontend monta o prompt do sistema (contexto de tarefas/metas) e envia `{ system, messages }` para `/api/chat`.
- A Vercel Function valida a entrada, injeta a `ANTHROPIC_API_KEY` do ambiente e repassa a chamada para a Anthropic.
- Erros da Anthropic nunca são repassados em detalhe ao cliente — apenas mensagens genéricas; os detalhes vão para os logs da função.
- Estado de tarefas/metas continua em `localStorage` (não há banco de dados).

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **React Router v6** (`HashRouter`, sem necessidade de rewrites de servidor para navegação)
- **Zustand v5** para state management
- **Vercel Functions** (Node.js runtime) para o backend serverless (`api/chat.ts`)
- **Anthropic API** (modelo `claude-haiku-4-5-20251001`) acessada exclusivamente pelo backend

## Estrutura do projeto

```
api/
  chat.ts            → Vercel Function: único ponto de contato com a Anthropic
src/
  components/        → Sidebar, TaskRow, Modal, Toast, ViewTabs, PriorityFlag
  views/             → Dashboard, TaskList, Kanban, Calendar, Goals, Agent
  services/
    agentService.ts  → monta o prompt, chama /api/chat, interpreta ações da IA
  store/useStore.ts  → estado global (Zustand) + persistência em localStorage
  types/, utils/, styles/
vercel.json          → rewrites de SPA
.env.example         → variáveis de ambiente necessárias
```

## Variáveis de ambiente

| Variável             | Onde é usada      | Descrição                                                        |
|----------------------|-------------------|-------------------------------------------------------------------|
| `ANTHROPIC_API_KEY`  | `api/chat.ts`     | Chave da API da Anthropic. **Nunca** exposta ao frontend/navegador. |

Copie `.env.example` para `.env` (uso local com `vercel dev`) e preencha o valor real — o `.env` está no `.gitignore` e nunca deve ser commitado.

## Desenvolvimento local

```bash
npm install

# Opção A: apenas o frontend (a Agent view falhará ao chamar /api/chat, pois não há servidor de function)
npm run dev

# Opção B: frontend + Vercel Functions localmente (recomendado)
npm i -g vercel   # se ainda não tiver a CLI
vercel dev
```

Com `vercel dev`, defina a variável `ANTHROPIC_API_KEY` no arquivo `.env` local (baseado em `.env.example`) — a CLI a injeta automaticamente na function.

## Build

```bash
npm run build
```

Executa `tsc` (checagem de tipos do frontend) seguido de `vite build`, gerando o bundle em `dist/`.

## Deploy na Vercel

1. Configure a variável de ambiente no projeto da Vercel:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
2. Deploy:
   ```bash
   vercel --prod
   ```

A Vercel detecta automaticamente o projeto Vite (build `npm run build`, output `dist/`) e publica `api/chat.ts` como Function serverless. O `vercel.json` garante que rotas do frontend caiam em `index.html` (relevante caso o roteamento migre de `HashRouter` para `BrowserRouter` no futuro).

## Segurança

- A `ANTHROPIC_API_KEY` só existe como variável de ambiente do servidor (Vercel), nunca em código, bundle JS ou `localStorage`.
- `api/chat.ts` valida `system` e `messages` (tipo, tamanho e quantidade) antes de repassar à Anthropic.
- Apenas o método `POST` é aceito; qualquer outro retorna `405`.
- Respostas de erro são genéricas ao cliente; detalhes ficam nos logs da função (`console.error`), evitando vazamento de informação sensível.
- `Cache-Control: no-store` na resposta da function, evitando cache de conversas.

## Possíveis melhorias futuras

- Rate limiting por IP/usuário na function (ex.: Vercel KV ou Upstash Redis), já que a função atual não tem estado entre invocações.
- Autenticação de usuários (hoje o app é single-tenant, sem login).
- Streaming da resposta da Anthropic (Server-Sent Events) para reduzir a percepção de latência no chat.
- Mover o estado de tarefas/metas para um banco de dados, permitindo uso em múltiplos dispositivos.
