#!/bin/bash

# Script de inicialização do MANUS Backend

echo "🚀 Iniciando MANUS Backend..."

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Por favor instale Python 3.9+"
    exit 1
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "📥 Instalando dependências..."
pip install -r requirements.txt

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "Por favor, crie um arquivo .env com sua ANTHROPIC_API_KEY"
    exit 1
fi

# Criar diretórios necessários
mkdir -p logs
mkdir -p /tmp/manus-workspaces

echo "✅ Configuração completa!"
echo ""
echo "Para iniciar o servidor:"
echo "  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Ou simplesmente:"
echo "  ./run.sh"
