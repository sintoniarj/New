@echo off
REM ============================================================
REM MANUS Platform - Deploy Docker (Windows)
REM ============================================================

REM Otimizações de build - desabilita provenance/attestation
set DOCKER_BUILDKIT=1
set BUILDX_NO_DEFAULT_ATTESTATIONS=1

color 0A
echo.
echo ========================================
echo   MANUS Platform - Docker Deploy
echo ========================================
echo.

REM Verificar se Docker está instalado
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERRO] Docker nao encontrado!
    echo.
    echo Por favor, instale o Docker Desktop:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Verificar se Docker está rodando
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERRO] Docker nao esta rodando!
    echo.
    echo Por favor, inicie o Docker Desktop e tente novamente.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker instalado e rodando
echo.

REM Verificar se docker-compose existe
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Usando 'docker compose' (Docker CLI integrado)
    set DOCKER_COMPOSE=docker compose
) else (
    echo [OK] docker-compose encontrado
    set DOCKER_COMPOSE=docker-compose
)

echo.
echo ========================================
echo   Menu de Opcoes
echo ========================================
echo.
echo 1. Deploy Completo (Build + Start)
echo 2. Start (Iniciar containers existentes)
echo 3. Stop (Parar containers)
echo 4. Restart (Reiniciar)
echo 5. Rebuild (Reconstruir imagens)
echo 6. Logs (Ver logs em tempo real)
echo 7. Status (Ver status dos containers)
echo 8. Clean (Limpar tudo)
echo 9. Sair
echo.

set /p choice="Escolha uma opcao (1-9): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto start
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto rebuild
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto status
if "%choice%"=="8" goto clean
if "%choice%"=="9" goto end

echo Opcao invalida!
pause
goto end

:deploy
echo.
echo ========================================
echo   Deploy Completo
echo ========================================
echo.
echo [1/4] Parando containers antigos...
%DOCKER_COMPOSE% down

echo.
echo [2/4] Construindo imagens...
%DOCKER_COMPOSE% build --no-cache

echo.
echo [3/4] Iniciando containers...
%DOCKER_COMPOSE% up -d

echo.
echo [4/4] Verificando status...
timeout /t 5 /nobreak >nul
%DOCKER_COMPOSE% ps

echo.
echo ========================================
echo   Deploy Concluido!
echo ========================================
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo Health Check: http://localhost:8000/health
echo.
echo Pressione qualquer tecla para ver os logs...
pause >nul
goto logs

:start
echo.
echo [INFO] Iniciando containers...
%DOCKER_COMPOSE% up -d
echo.
%DOCKER_COMPOSE% ps
echo.
echo [OK] Containers iniciados!
echo Frontend: http://localhost
echo Backend: http://localhost:8000
echo.
pause
goto end

:stop
echo.
echo [INFO] Parando containers...
%DOCKER_COMPOSE% stop
echo.
echo [OK] Containers parados!
pause
goto end

:restart
echo.
echo [INFO] Reiniciando containers...
%DOCKER_COMPOSE% restart
echo.
%DOCKER_COMPOSE% ps
echo.
echo [OK] Containers reiniciados!
pause
goto end

:rebuild
echo.
echo [INFO] Reconstruindo imagens...
%DOCKER_COMPOSE% build --no-cache
echo.
echo [OK] Imagens reconstruidas!
echo.
set /p restart_choice="Deseja reiniciar os containers? (S/N): "
if /i "%restart_choice%"=="S" (
    %DOCKER_COMPOSE% down
    %DOCKER_COMPOSE% up -d
    echo [OK] Containers reiniciados com novas imagens!
)
pause
goto end

:logs
echo.
echo ========================================
echo   Logs em Tempo Real
echo ========================================
echo.
echo Pressione Ctrl+C para sair dos logs
echo.
timeout /t 2 /nobreak >nul
%DOCKER_COMPOSE% logs -f

goto end

:status
echo.
echo ========================================
echo   Status dos Containers
echo ========================================
echo.
%DOCKER_COMPOSE% ps
echo.
echo ========================================
echo   Recursos Utilizados
echo ========================================
echo.
docker stats --no-stream manus-frontend manus-backend 2>nul
echo.
pause
goto end

:clean
echo.
echo ========================================
echo   ATENCAO: Limpeza Completa
echo ========================================
echo.
echo Isso vai:
echo - Parar todos os containers
echo - Remover containers
echo - Remover imagens
echo - Remover volumes (workspaces e logs)
echo.
set /p confirm="Tem certeza? (S/N): "

if /i NOT "%confirm%"=="S" (
    echo Operacao cancelada.
    pause
    goto end
)

echo.
echo [INFO] Limpando tudo...
%DOCKER_COMPOSE% down -v --rmi all
echo.
echo [OK] Limpeza concluida!
pause
goto end

:end
echo.
echo Ate logo!
timeout /t 2 /nobreak >nul
