import { FileNode, Project, PlanStep } from './types';

// Mock de projetos
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'meu-projeto-fastapi',
    path: '/workspace/meu-projeto-fastapi',
    createdAt: Date.now() - 86400000,
    lastModified: Date.now(),
  },
  {
    id: '2',
    name: 'frontend-react',
    path: '/workspace/frontend-react',
    createdAt: Date.now() - 172800000,
    lastModified: Date.now() - 3600000,
  },
];

// Mock de árvore de arquivos
export const mockFileTree: FileNode[] = [
  {
    name: 'backend',
    path: '/workspace/backend',
    type: 'directory',
    children: [
      {
        name: 'app',
        path: '/workspace/backend/app',
        type: 'directory',
        children: [
          {
            name: 'main.py',
            path: '/workspace/backend/app/main.py',
            type: 'file',
          },
          {
            name: 'routes',
            path: '/workspace/backend/app/routes',
            type: 'directory',
            children: [
              {
                name: 'chat.py',
                path: '/workspace/backend/app/routes/chat.py',
                type: 'file',
              },
              {
                name: 'agent.py',
                path: '/workspace/backend/app/routes/agent.py',
                type: 'file',
              },
            ],
          },
        ],
      },
      {
        name: 'requirements.txt',
        path: '/workspace/backend/requirements.txt',
        type: 'file',
      },
    ],
  },
  {
    name: 'frontend',
    path: '/workspace/frontend',
    type: 'directory',
    children: [
      {
        name: 'src',
        path: '/workspace/frontend/src',
        type: 'directory',
        children: [
          {
            name: 'App.tsx',
            path: '/workspace/frontend/src/App.tsx',
            type: 'file',
          },
          {
            name: 'main.tsx',
            path: '/workspace/frontend/src/main.tsx',
            type: 'file',
          },
        ],
      },
      {
        name: 'package.json',
        path: '/workspace/frontend/package.json',
        type: 'file',
      },
    ],
  },
  {
    name: 'README.md',
    path: '/workspace/README.md',
    type: 'file',
  },
];

// Mock de plano
export const mockPlanSteps: PlanStep[] = [
  {
    id: '1',
    title: 'Criar estrutura básica do projeto FastAPI',
    status: 'completed',
    description: 'Configurar diretórios e arquivos iniciais',
  },
  {
    id: '2',
    title: 'Implementar endpoint de chat',
    status: 'in-progress',
    description: 'Criar rota /api/chat com suporte a streaming',
  },
  {
    id: '3',
    title: 'Configurar WebSocket para comunicação em tempo real',
    status: 'pending',
    description: 'Implementar WS /ws/chat para streaming bidirecional',
  },
  {
    id: '4',
    title: 'Criar sistema de execução de comandos',
    status: 'pending',
    description: 'Sandbox Docker para executar comandos com segurança',
  },
  {
    id: '5',
    title: 'Implementar testes unitários',
    status: 'pending',
    description: 'Testar todas as rotas e funcionalidades principais',
  },
];

// Conteúdo de exemplo de arquivos
export const mockFileContents: Record<string, string> = {
  '/workspace/backend/app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MANUS API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MANUS API v1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
`,
  '/workspace/README.md': `# MANUS Project

Plataforma de desenvolvimento assistido com Claude Sonnet 4.5.

## Estrutura

- \`backend/\` - API Python FastAPI
- \`frontend/\` - Interface React + Vite

## Como executar

\`\`\`bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
\`\`\`
`,
};

// Função helper para carregar dados mockados na store
export const loadMockData = () => {
  const { setCurrentProject, setFileTree, setPlanSteps } = require('./store').useStore.getState();
  
  setCurrentProject(mockProjects[0]);
  setFileTree(mockFileTree);
  setPlanSteps(mockPlanSteps);
};
