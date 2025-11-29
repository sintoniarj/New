# MANUS Backend - AI Dev Platform

Backend Python para plataforma de desenvolvimento assistido com **Claude Sonnet 4.5**.

## 🎯 Funcionalidades

- ✅ **WebSocket** para streaming em tempo real
- ✅ **API REST** para gerenciamento de arquivos
- ✅ **Cliente Anthropic** com suporte a tools
- ✅ **Orquestrador de Agente** com loop automático
- ✅ **Sandbox seguro** para execução de comandos
- ✅ **Sistema de logs** estruturado (agent, system, exec)
- ✅ **Validação de segurança** para comandos perigosos

## 🏗️ Arquitetura

```
app/
├── main.py                    # FastAPI app principal
├── core/
│   ├── config.py             # Configurações (.env)
│   └── logging.py            # Sistema de logs
├── models/
│   └── schemas.py            # Pydantic models
├── routes/
│   ├── chat.py               # WebSocket /ws/chat
│   └── files.py              # API REST /api/files/*
└── services/
    ├── anthropic_client.py   # Cliente Claude API
    ├── agent_orchestrator.py # Loop do agente
    ├── file_manager.py       # Gerenciamento de arquivos
    └── sandbox.py            # Execução de comandos
```

## 📦 Instalação

### 1. Pré-requisitos

- Python 3.9+
- pip

### 2. Setup Rápido

```bash
# Tornar script executável
chmod +x setup.sh

# Executar setup
./setup.sh
```

### 3. Setup Manual

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios
mkdir -p logs
mkdir -p /tmp/manus-workspaces
```

### 4. Configurar .env

O arquivo `.env` já está criado com sua API key. Se precisar alterar:

```bash
ANTHROPIC_API_KEY=sua-chave-aqui
CLAUDE_MODEL=claude-sonnet-4-20250514
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

## 🚀 Executar

### Opção 1: Script (recomendado)

```bash
./run.sh
```

### Opção 2: Manual

```bash
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Opção 3: Direto do Python

```bash
python app/main.py
```

Servidor rodando em: **http://localhost:8000**

## 📡 Endpoints

### WebSocket

#### `WS /ws/chat`

Conexão WebSocket para chat em tempo real com streaming.

**Cliente → Servidor:**
```json
{
  "type": "chat",
  "content": "Crie uma API FastAPI",
  "mode": "agent"  // ou "assistant"
}
```

**Servidor → Cliente:**
```json
// Chunk de texto
{
  "type": "message_chunk",
  "content": "Vou criar..."
}

// Mensagem completa
{
  "type": "message_complete",
  "content": "Mensagem completa"
}

// Ação do agente
{
  "type": "agent_action",
  "action": {
    "type": "command",
    "description": "npm install",
    "status": "running"
  }
}

// Output do terminal
{
  "type": "terminal_output",
  "output": "$ npm install\n..."
}
```

### REST API

#### `GET /api/files/list`

Lista arquivos no workspace.

**Query params:**
- `session_id` (required)
- `path` (optional, default: ".")

**Response:**
```json
{
  "success": true,
  "tree": {
    "name": ".",
    "path": ".",
    "type": "directory",
    "children": [...]
  }
}
```

#### `GET /api/files/read`

Lê conteúdo de um arquivo.

**Query params:**
- `session_id` (required)
- `path` (required)

**Response:**
```json
{
  "path": "main.py",
  "content": "print('hello')"
}
```

#### `POST /api/files/write`

Cria ou sobrescreve arquivo.

**Query params:**
- `session_id` (required)

**Body:**
```json
{
  "path": "main.py",
  "content": "print('hello world')"
}
```

#### `DELETE /api/files/delete`

Deleta arquivo ou diretório.

**Query params:**
- `session_id` (required)
- `path` (required)

## 🛠️ Tools Disponíveis para o Agente

O Claude tem acesso a 4 ferramentas:

### 1. `run_command`

Executa comandos shell no workspace.

```json
{
  "command": "npm install",
  "cwd": "."
}
```

**Limitações de segurança:**
- Timeout: 60s (configurável)
- Comandos perigosos bloqueados (`rm -rf /`, `sudo`, etc)
- Output truncado se > 100KB
- Execução apenas dentro do workspace

### 2. `write_file`

Cria ou sobrescreve arquivos.

```json
{
  "path": "src/main.py",
  "content": "print('hello')"
}
```

**Limitações:**
- Tamanho máx: 10MB
- Apenas dentro do workspace

### 3. `read_file`

Lê conteúdo de arquivos.

```json
{
  "path": "package.json"
}
```

### 4. `list_files`

Lista estrutura de diretórios.

```json
{
  "path": "."
}
```

## 📁 Workspaces

Cada sessão cria um workspace isolado em:

```
/tmp/manus-workspaces/{session_id}/
```

- ✅ Isolamento por sessão
- ✅ Segurança: acesso restrito ao workspace
- ✅ Limpeza automática pode ser implementada

## 🔒 Segurança

### Comandos Bloqueados

O sistema bloqueia automaticamente:

- `rm -rf /`
- `dd if=`
- `mkfs`
- `chmod -R 777 /`
- `sudo`
- Acesso a `/etc/`, `/sys/`, `/dev/`
- Fork bombs

### Limites

- **Timeout**: 60s por comando
- **Output**: 100KB máximo
- **Arquivo**: 10MB máximo
- **Workspace**: Acesso restrito

## 📊 Logs

Logs estruturados em 3 arquivos:

### `logs/agent.log`

Ações do agente (planos, tools executadas).

### `logs/system.log`

Erros de infraestrutura, exceptions.

### `logs/exec.log`

Comandos executados e seus outputs.

## 🧪 Testando

### 1. Health Check

```bash
curl http://localhost:8000/health
```

### 2. WebSocket (usando wscat)

```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws/chat
```

Enviar:
```json
{"type":"chat","content":"Olá!","mode":"assistant"}
```

### 3. API REST

```bash
# Listar arquivos
curl "http://localhost:8000/api/files/list?session_id=test123&path=."

# Criar arquivo
curl -X POST "http://localhost:8000/api/files/write?session_id=test123" \
  -H "Content-Type: application/json" \
  -d '{"path":"hello.py","content":"print(\"hello\")"}'
```

## 🔄 Fluxo Completo

1. **Frontend** conecta WebSocket em `/ws/chat`
2. **Usuário** envia mensagem no modo "agent"
3. **Backend** processa com `AgentOrchestrator`
4. **Claude** analisa e decide usar tools
5. **Backend** executa tools (comandos, arquivos)
6. **Resultado** é enviado de volta ao Claude
7. **Claude** processa resultado e continua
8. **Loop** até completar a tarefa
9. **Frontend** recebe streaming de tudo

## 🐳 Docker (Futuro)

O `docker/sandbox.Dockerfile` está pronto para criar containers isolados.

Para usar:

```bash
# Build
docker build -f docker/sandbox.Dockerfile -t manus-sandbox .

# Run
docker run -it manus-sandbox
```

## 🔧 Desenvolvimento

### Estrutura de Dados

**Sessão:**
- `session_id`: UUID único
- `workspace`: Diretório isolado
- `conversation_history`: Histórico completo
- `orchestrator`: Instância do orquestrador

### Adicionando Novas Tools

1. Adicionar schema em `anthropic_client.py`
2. Implementar lógica em `agent_orchestrator.py`
3. Testar isoladamente

### Debug

Logs detalhados em modo `DEBUG=True`:

```python
from app.core.logging import log
log.bind(type="agent").debug("Debug message")
```

## 📝 TODO

- [ ] Implementar execução em Docker (sandbox real)
- [ ] Rate limiting por sessão
- [ ] Persistência de workspaces
- [ ] Autenticação/autorização
- [ ] Métricas e monitoring
- [ ] Testes unitários
- [ ] CI/CD pipeline

## 🤝 Integração com Frontend

O backend está **100% compatível** com o frontend React que você já tem.

Certifique-se que:
1. Backend roda em `http://localhost:8000`
2. Frontend configura proxy correto (já está em `vite.config.ts`)
3. WebSocket conecta em `ws://localhost:8000/ws/chat`

## 📚 Referências

- [Anthropic API Docs](https://docs.anthropic.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Pronto para uso!** 🚀

Execute `./run.sh` e conecte seu frontend.
