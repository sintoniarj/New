# 🚀 QUICKSTART - MANUS Backend

## 3 Passos para Começar

### 1️⃣ Instalar Dependências (1 minuto)

```bash
cd manus-backend
./setup.sh
```

Ou manualmente:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2️⃣ Verificar .env

O arquivo `.env` já existe com sua API key configurada:

```bash
cat .env
```

Deve mostrar:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-20250514
...
```

✅ Tudo certo!

### 3️⃣ Executar (10 segundos)

```bash
./run.sh
```

Ou:

```bash
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Pronto!** Backend rodando em http://localhost:8000

## ✅ Validar

### 1. Health Check

```bash
curl http://localhost:8000/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "model": "claude-sonnet-4-20250514",
  "workspace": "/tmp/manus-workspaces"
}
```

### 2. WebSocket (opcional)

```bash
# Instalar wscat
npm install -g wscat

# Conectar
wscat -c ws://localhost:8000/ws/chat
```

Enviar:
```json
{"type":"chat","content":"Olá, Claude!","mode":"assistant"}
```

Deve receber resposta do Claude!

## 🎨 Conectar Frontend

Com o backend rodando:

```bash
cd ../manus-frontend
npm run dev
```

Acesse http://localhost:3000 e comece a usar!

## 🐛 Problemas Comuns

**Erro: "ModuleNotFoundError: No module named 'anthropic'"**
- Solução: `pip install -r requirements.txt`

**Erro: "Connection refused" no WebSocket**
- Certifique-se que o backend está rodando
- Verifique se está na porta 8000: `lsof -i :8000`

**Erro: "API key inválida"**
- Verifique o arquivo .env
- Certifique-se que a chave está correta

## 📁 Estrutura de Pastas

Após setup, você terá:

```
manus-backend/
├── venv/              # Ambiente virtual Python
├── logs/              # Logs (criado automaticamente)
├── app/               # Código fonte
├── .env               # Configurações ✅
├── requirements.txt   # Dependências
└── run.sh            # Script de execução
```

## 🔥 Próximos Passos

1. ✅ Backend rodando
2. ✅ Frontend rodando
3. 🎯 Abra http://localhost:3000
4. 🤖 Ative modo "Agente"
5. 💬 Peça: "Crie uma API FastAPI com endpoint /hello"
6. 🎉 Veja a mágica acontecer!

---

**Dúvidas?** Consulte o README.md completo.
