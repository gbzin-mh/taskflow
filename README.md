# TaskFlow

Gerenciador pessoal de tarefas e metas — SPA em React, hospedado gratuitamente na Vercel.

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **React Router v6** (`HashRouter`)
- **Zustand v5** para state management
- Persistência em `localStorage` (sem backend, sem banco de dados)

## Estrutura do projeto

```
src/
  components/   → Sidebar, TaskRow, Modal, Toast, ViewTabs, PriorityFlag
  views/        → Dashboard, TaskList, Kanban, Calendar, Goals
  store/useStore.ts → estado global (Zustand) + persistência em localStorage
  types/, utils/, styles/
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Executa `tsc` (checagem de tipos) seguido de `vite build`, gerando o bundle em `dist/`.

## Deploy na Vercel

```bash
npm i -g vercel   # se ainda não tiver a CLI
vercel --prod
```

A Vercel detecta automaticamente o projeto Vite (build `npm run build`, output `dist/`) — não há configuração adicional necessária.

## Notas

- Um assistente de IA (via Anthropic) chegou a ser prototipado neste projeto, mas foi removido por enquanto — ainda é cedo para essa funcionalidade. O histórico da implementação (frontend + backend serverless seguro) fica disponível no histórico do Git, caso seja retomado no futuro.
