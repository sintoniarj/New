# 🐳 MANUS Platform - Deploy Docker

Deploy completo da plataforma MANUS usando Docker e Docker Compose.

---

## 📋 Pré-requisitos

### Windows
- ✅ **Docker Desktop** instalado e rodando
- ✅ Baixe em: https://www.docker.com/products/docker-desktop

### Linux/Mac
- ✅ **Docker** instalado
- ✅ **Docker Compose** instalado

---

## 🚀 Deploy Rápido (Windows)

### Opção 1: Usando o Script .bat (RECOMENDADO)

```batch
REM Extrair os ZIPs na mesma pasta
REM Deve ter: manus-frontend/ e manus-backend/ na mesma pasta

REM Executar o deploy
deploy.bat
```

**Menu do deploy.bat:**
1. Deploy Completo (Build + Start) ← Use esta primeira vez
2. Start (Iniciar containers)
3. Stop (Parar containers)
4. Restart (Reiniciar)
5. Rebuild (Reconstruir imagens)
6. Logs (Ver logs)
7. Status (Ver status)
8. Clean (Limpar tudo)

### Opção 2: Comandos Manuais

```batch
REM Build das imagens
docker-compose build

REM Iniciar containers
docker-compose up -d

REM Ver logs
docker-compose logs -f
```

---

## 🐧 Deploy no Linux/Mac

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Stop
docker-compose down
```

---

## 📂 Estrutura de Arquivos Necessária

```
seu-diretorio/
├── manus-frontend/          # Frontend (extraído do ZIP)
│   ├── src/
│   ├── Dockerfile           # ✅ Já incluído
│   ├── nginx.conf           # ✅ Já incluído
│   └── package.json
│
├── manus-backend/           # Backend (extraído do ZIP)
│   ├── app/
│   ├── Dockerfile           # ✅ Já incluído
│   ├── requirements.txt
│   └── .env                 # ✅ API key configurada
│
├── docker-compose.yml       # ✅ Orquestração
├── .env                     # ✅ Variáveis de ambiente
├── deploy.bat               # ✅ Script Windows
└── DOCKER-DEPLOY.md         # Este arquivo
```

---

## 🔧 Configuração

### 1. Verificar .env

O arquivo `.env` já está configurado com sua API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-20250514
```

✅ **Pronto para usar!**

### 2. Portas

Por padrão:
- **Frontend**: http://localhost (porta 80)
- **Backend**: http://localhost:8000

Para mudar as portas, edite `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:80"  # Mude 80 para outra porta
  
  backend:
    ports:
      - "9000:8000"  # Mude 8000 para outra porta
```

---

## 📊 Verificar Status

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost
```

### Ver Containers Rodando

```bash
docker-compose ps
```

Saída esperada:
```
NAME               STATUS        PORTS
manus-backend      Up (healthy)  0.0.0.0:8000->8000/tcp
manus-frontend     Up (healthy)  0.0.0.0:80->80/tcp
```

### Ver Logs

```bash
# Todos os logs
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Últimas 100 linhas
docker-compose logs --tail=100
```

---

## 🎯 Testar a Aplicação

### 1. Abrir no Browser

Acesse: **http://localhost**

Deve ver a interface do MANUS carregando.

### 2. Verificar Conexão

No console do navegador (F12), deve aparecer:
```
✓ Conectado ao backend
```

### 3. Testar Chat

1. Clique em modo **"🤖 Agente"**
2. Digite: "Olá, Claude!"
3. Deve receber resposta

### 4. Testar Criação de Arquivo

Digite:
```
Crie um arquivo hello.py com print('Hello from Docker!')
```

Deve ver:
- ✅ Arquivo criado
- ✅ Aparece na árvore de arquivos
- ✅ Histórico registra a ação

---

## 🔄 Comandos Úteis

### Iniciar
```bash
docker-compose up -d
```

### Parar
```bash
docker-compose stop
```

### Parar e Remover
```bash
docker-compose down
```

### Rebuild (após mudanças no código)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ver Recursos Utilizados
```bash
docker stats
```

### Acessar Shell do Container

**Backend:**
```bash
docker exec -it manus-backend bash
```

**Frontend:**
```bash
docker exec -it manus-frontend sh
```

---

## 📁 Volumes Persistentes

O Docker Compose cria volumes para persistir dados:

### 1. Workspaces
```
backend-workspaces → /tmp/manus-workspaces
```
Armazena todos os projetos criados.

### 2. Logs
```
backend-logs → /app/logs
```
Armazena logs do backend.

### Ver Volumes
```bash
docker volume ls
```

### Backup de Volume
```bash
docker run --rm -v nome-volume:/data -v $(pwd):/backup ubuntu tar czf /backup/backup.tar.gz /data
```

### Limpar Volumes
```bash
docker-compose down -v
```
⚠️ **ATENÇÃO**: Isso apaga todos os workspaces!

---

## 🐛 Troubleshooting

### Erro: "port is already allocated"

**Causa**: Porta já em uso

**Solução**:
```bash
# Windows - Verificar quem está usando a porta 80
netstat -ano | findstr :80

# Matar processo
taskkill /PID <numero_do_pid> /F

# Ou mudar porta no docker-compose.yml
```

### Erro: "Cannot connect to the Docker daemon"

**Causa**: Docker não está rodando

**Solução**:
1. Abra Docker Desktop
2. Aguarde inicializar completamente
3. Tente novamente

### Frontend não conecta ao Backend

**Verificar**:
```bash
# Backend está rodando?
docker-compose ps

# Logs do backend
docker-compose logs backend

# Teste direto
curl http://localhost:8000/health
```

### Build falha

**Solução**:
```bash
# Limpar cache
docker-compose build --no-cache

# Remover imagens antigas
docker-compose down --rmi all

# Rebuild
docker-compose build
docker-compose up -d
```

### Container reiniciando constantemente

**Ver por quê**:
```bash
docker-compose logs backend
```

Comum:
- ❌ API key inválida → Verificar .env
- ❌ Porta em uso → Mudar porta
- ❌ Memória insuficiente → Aumentar recursos do Docker

---

## 🔒 Segurança

### Produção

Para deploy em produção, faça:

1. **HTTPS**: Use Nginx com SSL
2. **API Key**: Use secrets do Docker
3. **Firewall**: Exponha apenas porta 443
4. **Recursos**: Limite CPU/RAM
5. **Logs**: Configure rotação
6. **Backup**: Automatize backups dos volumes

### docker-compose.prod.yml (exemplo)

```yaml
version: '3.8'

services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - DEBUG=False
    restart: always

  frontend:
    restart: always
```

Executar:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📈 Monitoramento

### Logs Estruturados

```bash
# Backend logs separados
docker exec manus-backend ls -la /app/logs/

# Ver log específico
docker exec manus-backend tail -f /app/logs/agent.log
```

### Métricas

```bash
# Uso de recursos em tempo real
docker stats manus-frontend manus-backend

# Informações detalhadas
docker inspect manus-backend
```

---

## 🚀 Deploy em Cloud

### AWS ECS

1. Build e push para ECR
2. Criar Task Definitions
3. Criar Service
4. Configurar Load Balancer

### Google Cloud Run

```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT_ID/manus-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/manus-frontend

# Deploy
gcloud run deploy manus-backend --image gcr.io/PROJECT_ID/manus-backend
gcloud run deploy manus-frontend --image gcr.io/PROJECT_ID/manus-frontend
```

### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name manus-backend \
  --image myregistry.azurecr.io/manus-backend \
  --ports 8000
```

---

## 📝 Checklist de Deploy

Antes de fazer deploy:

- [ ] Docker Desktop instalado e rodando
- [ ] Arquivos extraídos corretamente
- [ ] `.env` configurado com API key
- [ ] Portas 80 e 8000 livres
- [ ] `docker-compose.yml` na raiz
- [ ] Dockerfiles nos respectivos diretórios

Após deploy:

- [ ] `docker-compose ps` mostra containers "Up (healthy)"
- [ ] `curl http://localhost:8000/health` retorna JSON
- [ ] http://localhost abre a interface
- [ ] Console mostra "Conectado ao backend"
- [ ] Chat funciona
- [ ] Modo Agente cria arquivos

**Tudo OK?** Deploy bem-sucedido! ✅

---

## 🎉 Resultado

Após executar `deploy.bat` (opção 1), você terá:

✅ **Frontend** rodando em http://localhost
✅ **Backend** rodando em http://localhost:8000
✅ **Workspaces** persistentes
✅ **Logs** persistentes
✅ **Health checks** configurados
✅ **Auto-restart** ativado
✅ **Proxy** configurado (Nginx)
✅ **CORS** funcionando
✅ **WebSocket** conectado

**Pronto para usar!** 🚀

---

## 📞 Suporte

**Problemas comuns**: Veja seção Troubleshooting acima

**Logs detalhados**:
```bash
docker-compose logs -f --tail=1000
```

**Resetar tudo**:
```bash
docker-compose down -v --rmi all
```
Depois execute `deploy.bat` novamente.

---

**Deploy Docker configurado com sucesso!** 🐳✨
