# MANUS Frontend - AI Dev Platform

Interface web profissional para desenvolvimento assistido com Claude Sonnet 4.5.

## 🎨 Features

- **Editor de código Monaco** (VSCode in browser)
- **Terminal emulado** com xterm.js
- **Chat integrado** com Claude 4.5
- **Dois modos**: Assistente (só conversa) e Agente (executa ações)
- **Tema dark** profissional e sem distrações
- **Streaming em tempo real** via WebSocket
- **Gerenciamento de arquivos** com árvore navegável
- **Plano visual** das tarefas do agente
- **Histórico de ações** executadas

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Vite** (bundler ultra-rápido)
- **TailwindCSS** (styling)
- **Monaco Editor** (editor de código)
- **xterm.js** (terminal emulado)
- **Zustand** (gerenciamento de estado)
- **Lucide React** (ícones)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🔧 Configuração

O frontend está configurado para conectar com o backend em:
- HTTP: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws/chat`

Para alterar, edite o arquivo `vite.config.ts`.

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Sidebar.tsx          # Projetos e árvore de arquivos
│   ├── CentralPanel.tsx     # Container dos painéis centrais
│   ├── CodeEditor.tsx       # Editor Monaco
│   ├── PlanView.tsx         # Visualização do plano
│   ├── HistoryView.tsx      # Histórico de ações
│   ├── BottomPanel.tsx      # Container terminal/logs
│   ├── Terminal.tsx         # Terminal xterm.js
│   └── ChatPanel.tsx        # Chat com Claude
├── store.ts                 # Estado global (Zustand)
├── types.ts                 # TypeScript types
├── App.tsx                  # Componente principal
├── main.tsx                 # Entry point
└── index.css                # Estilos globais
```

## 🎨 Tema Dark

Cores customizadas (configuradas no `tailwind.config.js`):

- Background: `#0d1117`
- Surface: `#161b22`
- Border: `#30363d`
- Accent: `#58a6ff`
- Text: `#e6edf3`

## 🔌 WebSocket Protocol

O frontend espera mensagens no formato:

```json
{
  "type": "message_complete" | "plan" | "agent_action" | "terminal_output",
  "content": "...",
  "steps": [...],
  "action": {...},
  "output": "..."
}
```

## 🎯 Próximos Passos

Para ter uma experiência completa:

1. **Backend Python** precisa estar rodando na porta 8000
2. **Implementar endpoints**:
   - `GET /api/files` - listar arquivos
   - `GET /api/files/:path` - ler arquivo
   - `POST /api/files` - criar/atualizar arquivo
   - `WS /ws/chat` - streaming de mensagens

## 📝 Uso

### Modo Assistente 🧠
- Apenas conversação
- Claude responde perguntas
- Sem acesso a ferramentas

### Modo Agente 🤖
- Pode criar/editar arquivos
- Executa comandos no terminal
- Gera planos de execução
- Mantém histórico de ações

## 🛠️ Desenvolvimento

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📄 Licença

MIT
