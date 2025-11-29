# 🚀 Guia de Início Rápido - MANUS Frontend

## Instalação (5 minutos)

```bash
# 1. Entre na pasta do projeto
cd manus-frontend

# 2. Instale as dependências
npm install

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 🎮 Testando sem Backend

O projeto inclui um **DevTools** (botão flutuante azul no canto inferior direito) que permite:

1. **Carregar dados mockados** - preenche a interface com dados de exemplo
2. **Testar mensagens** - adiciona mensagens de chat fictícias
3. **Simular terminal** - adiciona output no terminal
4. **Testar ações do agente** - adiciona ações no histórico

**Como usar:**

1. Abra o DevTools (botão azul ⚙️)
2. Clique em "Carregar Mock Completo"
3. Explore a interface: árvore de arquivos, plano, histórico, etc.
4. Abra um arquivo mockado
5. Teste o chat (as mensagens não vão realmente para o backend)

## 🔧 Próximos Passos para Produção

### 1. Backend WebSocket

O frontend espera um WebSocket em `ws://localhost:8000/ws/chat`.

**Formato de mensagens esperado:**

```json
// Cliente → Servidor
{
  "type": "chat",
  "content": "Crie uma API FastAPI...",
  "mode": "agent" // ou "assistant"
}

// Servidor → Cliente (streaming)
{
  "type": "message_chunk",
  "content": "Vou criar..."
}

// Servidor → Cliente (mensagem completa)
{
  "type": "message_complete",
  "content": "Mensagem completa aqui"
}

// Servidor → Cliente (plano)
{
  "type": "plan",
  "steps": [
    {
      "id": "1",
      "title": "Criar estrutura",
      "status": "completed",
      "description": "..."
    }
  ]
}

// Servidor → Cliente (ação do agente)
{
  "type": "agent_action",
  "action": {
    "id": "1",
    "type": "command",
    "description": "Executando npm install",
    "timestamp": 1234567890,
    "status": "success",
    "output": "..."
  }
}

// Servidor → Cliente (output do terminal)
{
  "type": "terminal_output",
  "output": "$ npm install\n"
}
```

### 2. Endpoints HTTP Adicionais

Implemente estes endpoints no backend:

- `GET /api/projects` - listar projetos
- `GET /api/files?path=/workspace` - listar arquivos
- `GET /api/files/content?path=/workspace/main.py` - ler arquivo
- `POST /api/files` - criar/atualizar arquivo
- `DELETE /api/files?path=/workspace/old.py` - deletar arquivo

### 3. Remover DevTools

Antes do deploy em produção:

```tsx
// Em src/App.tsx, remover ou comentar:
{import.meta.env.DEV && <DevTools />}
```

## 🎨 Customização

### Tema de Cores

Edite `tailwind.config.js`:

```js
colors: {
  dark: {
    bg: '#0d1117',      // Fundo principal
    surface: '#161b22', // Painéis
    accent: '#58a6ff',  // Cor de destaque
    // ...
  }
}
```

### Layout

Os tamanhos são configuráveis:

- **Sidebar**: `w-64` (16rem) em `Sidebar.tsx`
- **Chat**: `w-96` (24rem) em `ChatPanel.tsx`
- **Bottom Panel**: `h-64` (16rem) em `BottomPanel.tsx`

## 📱 Responsividade

Atualmente otimizado para desktop (1920x1080+).

Para mobile, adicione breakpoints:

```tsx
<div className="w-64 lg:w-96 md:w-full">
```

## 🐛 Troubleshooting

**Terminal não aparece:**
- Verifique se `@xterm/xterm` foi instalado corretamente
- Rode: `npm install @xterm/xterm @xterm/addon-fit`

**Monaco Editor não carrega:**
- Pode demorar alguns segundos na primeira vez
- Verifique o console do navegador

**WebSocket não conecta:**
- Certifique-se que o backend está rodando na porta 8000
- Verifique o console: deve aparecer "✓ Conectado ao backend"

## 💡 Dicas

1. Use o **DevTools** para desenvolvimento rápido
2. O Monaco Editor tem **IntelliSense** automático
3. O terminal suporta **cores ANSI**
4. O estado é global via **Zustand** - fácil de debugar

## 📚 Estrutura de Componentes

```
App
├── Sidebar (projetos + arquivos)
├── CentralPanel
│   ├── CodeEditor (Monaco)
│   ├── PlanView
│   └── HistoryView
├── BottomPanel
│   ├── Terminal (xterm.js)
│   └── Logs
└── ChatPanel
```

## 🔗 Links Úteis

- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [xterm.js Docs](https://xtermjs.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TailwindCSS](https://tailwindcss.com/)

---

**Pronto!** Agora você tem um frontend completo para sua plataforma MANUS. 🎉
