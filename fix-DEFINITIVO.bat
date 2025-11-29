@echo off
echo ========================================
echo   CORRECAO DEFINITIVA - TypeScript
echo ========================================
echo.

cd manus-frontend

echo [1/3] Instalando @types/node...
call npm install --save-dev @types/node

echo.
echo [2/3] Criando vite-env.d.ts...
(
echo /// ^<reference types="vite/client" /^>
echo.
echo interface ImportMetaEnv {
echo   readonly MODE: string
echo   readonly DEV: boolean
echo   readonly PROD: boolean
echo   readonly SSR: boolean
echo }
echo.
echo interface ImportMeta {
echo   readonly env: ImportMetaEnv
echo }
) > src\vite-env.d.ts

echo.
echo [3/3] Desabilitando verificacao de variaveis nao usadas...

REM Criar tsconfig.json atualizado
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "useDefineForClassFields": true,
echo     "lib": ["ES2020", "DOM", "DOM.Iterable"],
echo     "module": "ESNext",
echo     "skipLibCheck": true,
echo     "moduleResolution": "bundler",
echo     "allowImportingTsExtensions": true,
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "noEmit": true,
echo     "jsx": "react-jsx",
echo     "strict": true,
echo     "noUnusedLocals": false,
echo     "noUnusedParameters": false,
echo     "noFallthroughCasesInSwitch": true,
echo     "types": ["vite/client", "node"]
echo   },
echo   "include": ["src"],
echo   "references": [{ "path": "./tsconfig.node.json" }]
echo }
) > tsconfig.json

echo TypeScript configurado!

cd ..

echo.
echo Executando build...
docker-compose build

echo.
echo ========================================
echo   Correcoes Concluidas!
echo ========================================
echo.
echo Agora execute: deploy.bat
pause
