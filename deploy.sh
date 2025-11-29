#!/bin/bash

# ============================================================
# MANUS Platform - Deploy Docker (Linux/Mac)
# ============================================================

# Otimizações de build - desabilita provenance/attestation
export DOCKER_BUILDKIT=1
export BUILDX_NO_DEFAULT_ATTESTATIONS=1

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "========================================"
echo "  MANUS Platform - Docker Deploy"
echo "========================================"
echo -e "${NC}"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Docker não encontrado!"
    echo ""
    echo "Por favor, instale o Docker:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Docker não está rodando!"
    echo ""
    echo "Por favor, inicie o Docker e tente novamente."
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Docker instalado e rodando"

# Verificar docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${GREEN}[OK]${NC} docker-compose encontrado"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${YELLOW}[INFO]${NC} Usando 'docker compose' (Docker CLI integrado)"
else
    echo -e "${RED}[ERRO]${NC} docker-compose não encontrado!"
    exit 1
fi

echo ""

# Menu
while true; do
    echo -e "${BLUE}========================================"
    echo "  Menu de Opções"
    echo "========================================${NC}"
    echo ""
    echo "1. Deploy Completo (Build + Start)"
    echo "2. Start (Iniciar containers existentes)"
    echo "3. Stop (Parar containers)"
    echo "4. Restart (Reiniciar)"
    echo "5. Rebuild (Reconstruir imagens)"
    echo "6. Logs (Ver logs em tempo real)"
    echo "7. Status (Ver status dos containers)"
    echo "8. Clean (Limpar tudo)"
    echo "9. Sair"
    echo ""
    read -p "Escolha uma opção (1-9): " choice

    case $choice in
        1)
            echo ""
            echo -e "${BLUE}========================================"
            echo "  Deploy Completo"
            echo "========================================${NC}"
            echo ""
            echo -e "${YELLOW}[1/4]${NC} Parando containers antigos..."
            $DOCKER_COMPOSE down
            
            echo ""
            echo -e "${YELLOW}[2/4]${NC} Construindo imagens..."
            $DOCKER_COMPOSE build --no-cache
            
            echo ""
            echo -e "${YELLOW}[3/4]${NC} Iniciando containers..."
            $DOCKER_COMPOSE up -d
            
            echo ""
            echo -e "${YELLOW}[4/4]${NC} Verificando status..."
            sleep 5
            $DOCKER_COMPOSE ps
            
            echo ""
            echo -e "${GREEN}========================================"
            echo "  Deploy Concluído!"
            echo "========================================${NC}"
            echo ""
            echo "Frontend: http://localhost"
            echo "Backend API: http://localhost:8000"
            echo "Health Check: http://localhost:8000/health"
            echo ""
            read -p "Pressione ENTER para ver os logs..."
            $DOCKER_COMPOSE logs -f
            ;;
        
        2)
            echo ""
            echo -e "${YELLOW}[INFO]${NC} Iniciando containers..."
            $DOCKER_COMPOSE up -d
            echo ""
            $DOCKER_COMPOSE ps
            echo ""
            echo -e "${GREEN}[OK]${NC} Containers iniciados!"
            echo "Frontend: http://localhost"
            echo "Backend: http://localhost:8000"
            echo ""
            read -p "Pressione ENTER para continuar..."
            ;;
        
        3)
            echo ""
            echo -e "${YELLOW}[INFO]${NC} Parando containers..."
            $DOCKER_COMPOSE stop
            echo ""
            echo -e "${GREEN}[OK]${NC} Containers parados!"
            read -p "Pressione ENTER para continuar..."
            ;;
        
        4)
            echo ""
            echo -e "${YELLOW}[INFO]${NC} Reiniciando containers..."
            $DOCKER_COMPOSE restart
            echo ""
            $DOCKER_COMPOSE ps
            echo ""
            echo -e "${GREEN}[OK]${NC} Containers reiniciados!"
            read -p "Pressione ENTER para continuar..."
            ;;
        
        5)
            echo ""
            echo -e "${YELLOW}[INFO]${NC} Reconstruindo imagens..."
            $DOCKER_COMPOSE build --no-cache
            echo ""
            echo -e "${GREEN}[OK]${NC} Imagens reconstruídas!"
            echo ""
            read -p "Deseja reiniciar os containers? (s/N): " restart_choice
            if [[ $restart_choice =~ ^[Ss]$ ]]; then
                $DOCKER_COMPOSE down
                $DOCKER_COMPOSE up -d
                echo -e "${GREEN}[OK]${NC} Containers reiniciados com novas imagens!"
            fi
            read -p "Pressione ENTER para continuar..."
            ;;
        
        6)
            echo ""
            echo -e "${BLUE}========================================"
            echo "  Logs em Tempo Real"
            echo "========================================${NC}"
            echo ""
            echo "Pressione Ctrl+C para sair dos logs"
            echo ""
            sleep 2
            $DOCKER_COMPOSE logs -f
            ;;
        
        7)
            echo ""
            echo -e "${BLUE}========================================"
            echo "  Status dos Containers"
            echo "========================================${NC}"
            echo ""
            $DOCKER_COMPOSE ps
            echo ""
            echo -e "${BLUE}========================================"
            echo "  Recursos Utilizados"
            echo "========================================${NC}"
            echo ""
            docker stats --no-stream manus-frontend manus-backend 2>/dev/null || true
            echo ""
            read -p "Pressione ENTER para continuar..."
            ;;
        
        8)
            echo ""
            echo -e "${RED}========================================"
            echo "  ATENÇÃO: Limpeza Completa"
            echo "========================================${NC}"
            echo ""
            echo "Isso vai:"
            echo "- Parar todos os containers"
            echo "- Remover containers"
            echo "- Remover imagens"
            echo "- Remover volumes (workspaces e logs)"
            echo ""
            read -p "Tem certeza? (s/N): " confirm
            
            if [[ $confirm =~ ^[Ss]$ ]]; then
                echo ""
                echo -e "${YELLOW}[INFO]${NC} Limpando tudo..."
                $DOCKER_COMPOSE down -v --rmi all
                echo ""
                echo -e "${GREEN}[OK]${NC} Limpeza concluída!"
            else
                echo "Operação cancelada."
            fi
            read -p "Pressione ENTER para continuar..."
            ;;
        
        9)
            echo ""
            echo "Até logo!"
            exit 0
            ;;
        
        *)
            echo -e "${RED}Opção inválida!${NC}"
            sleep 2
            ;;
    esac
    
    echo ""
done
