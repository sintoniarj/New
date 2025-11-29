export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface PlanStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description?: string;
}

export interface AgentAction {
  id: string;
  type: 'command' | 'file_write' | 'file_read' | 'plan';
  description: string;
  timestamp: number;
  status: 'running' | 'success' | 'error';
  output?: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: number;
  lastModified: number;
}

export type AgentMode = 'assistant' | 'agent';
export type CentralTab = 'editor' | 'plan' | 'history';
export type BottomTab = 'terminal' | 'logs';
