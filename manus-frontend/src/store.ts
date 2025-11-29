import { create } from 'zustand';
import { 
  FileNode, 
  ChatMessage, 
  PlanStep, 
  AgentAction, 
  Project, 
  AgentMode, 
  CentralTab, 
  BottomTab 
} from './types';

interface AppState {
  // Projects
  currentProject: Project | null;
  projects: Project[];
  
  // Files
  fileTree: FileNode[];
  openFiles: Map<string, string>; // path -> content
  activeFile: string | null;
  
  // Chat
  messages: ChatMessage[];
  isStreaming: boolean;
  agentMode: AgentMode;
  
  // Plan
  planSteps: PlanStep[];
  
  // Agent Actions
  agentActions: AgentAction[];
  
  // UI State
  centralTab: CentralTab;
  bottomTab: BottomTab;
  terminalOutput: string;
  logs: string[];
  
  // WebSocket
  ws: WebSocket | null;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  
  setFileTree: (tree: FileNode[]) => void;
  openFile: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  
  addMessage: (message: ChatMessage) => void;
  setIsStreaming: (streaming: boolean) => void;
  setAgentMode: (mode: AgentMode) => void;
  
  setPlanSteps: (steps: PlanStep[]) => void;
  updatePlanStep: (id: string, updates: Partial<PlanStep>) => void;
  
  addAgentAction: (action: AgentAction) => void;
  updateAgentAction: (id: string, updates: Partial<AgentAction>) => void;
  
  setCentralTab: (tab: CentralTab) => void;
  setBottomTab: (tab: BottomTab) => void;
  appendTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;
  addLog: (log: string) => void;
  
  setWebSocket: (ws: WebSocket | null) => void;
  sendMessage: (content: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentProject: null,
  projects: [],
  fileTree: [],
  openFiles: new Map(),
  activeFile: null,
  messages: [],
  isStreaming: false,
  agentMode: 'assistant',
  planSteps: [],
  agentActions: [],
  centralTab: 'editor',
  bottomTab: 'terminal',
  terminalOutput: '',
  logs: [],
  ws: null,

  // Projects
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),

  // Files
  setFileTree: (tree) => set({ fileTree: tree }),
  openFile: (path, content) => set((state) => {
    const newOpenFiles = new Map(state.openFiles);
    newOpenFiles.set(path, content);
    return { openFiles: newOpenFiles, activeFile: path };
  }),
  closeFile: (path) => set((state) => {
    const newOpenFiles = new Map(state.openFiles);
    newOpenFiles.delete(path);
    const activeFile = state.activeFile === path ? null : state.activeFile;
    return { openFiles: newOpenFiles, activeFile };
  }),
  setActiveFile: (path) => set({ activeFile: path }),
  updateFileContent: (path, content) => set((state) => {
    const newOpenFiles = new Map(state.openFiles);
    newOpenFiles.set(path, content);
    return { openFiles: newOpenFiles };
  }),

  // Chat
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setAgentMode: (mode) => set({ agentMode: mode }),

  // Plan
  setPlanSteps: (steps) => set({ planSteps: steps }),
  updatePlanStep: (id, updates) => set((state) => ({
    planSteps: state.planSteps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    )
  })),

  // Agent Actions
  addAgentAction: (action) => set((state) => ({ 
    agentActions: [...state.agentActions, action] 
  })),
  updateAgentAction: (id, updates) => set((state) => ({
    agentActions: state.agentActions.map(action =>
      action.id === id ? { ...action, ...updates } : action
    )
  })),

  // UI
  setCentralTab: (tab) => set({ centralTab: tab }),
  setBottomTab: (tab) => set({ bottomTab: tab }),
  appendTerminalOutput: (output) => set((state) => ({ 
    terminalOutput: state.terminalOutput + output 
  })),
  clearTerminalOutput: () => set({ terminalOutput: '' }),
  addLog: (log) => set((state) => ({ 
    logs: [...state.logs, `[${new Date().toLocaleTimeString()}] ${log}`] 
  })),

  // WebSocket
  setWebSocket: (ws) => set({ ws }),
  sendMessage: (content) => {
    const { ws, agentMode, addMessage } = get();
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    addMessage(message);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat',
        content,
        mode: agentMode,
      }));
      
      set({ isStreaming: true });
    }
  },
}));
