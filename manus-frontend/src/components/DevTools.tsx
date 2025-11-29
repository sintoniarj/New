import { useState } from 'react';
import { useStore } from '../store';
import { loadMockData, mockFileContents } from '../mockData';
import { Settings, Database, Trash2 } from 'lucide-react';

/**
 * DevTools - Painel de desenvolvimento para testar funcionalidades
 * Remover em produção
 */
const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    addMessage,
    setPlanSteps,
    addAgentAction,
    appendTerminalOutput,
    clearTerminalOutput,
    openFile,
  } = useStore();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-dark-accent rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        title="Abrir DevTools"
      >
        <Settings size={20} />
      </button>
    );
  }

  const handleLoadMockData = () => {
    loadMockData();
    alert('Dados mockados carregados!');
  };

  const handleAddTestMessage = () => {
    addMessage({
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Esta é uma mensagem de teste do Claude. Tudo funcionando perfeitamente!',
      timestamp: Date.now(),
    });
  };

  const handleAddTerminalOutput = () => {
    appendTerminalOutput('$ npm install\n');
    appendTerminalOutput('Installing dependencies...\n');
    appendTerminalOutput('✓ Done in 2.5s\n');
  };

  const handleOpenMockFile = () => {
    const path = '/workspace/backend/app/main.py';
    const content = mockFileContents[path];
    if (content) {
      openFile(path, content);
    }
  };

  const handleAddAgentAction = () => {
    addAgentAction({
      id: Date.now().toString(),
      type: 'command',
      description: 'Executando npm install',
      timestamp: Date.now(),
      status: 'success',
      output: 'Dependencies installed successfully',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-dark-surface border border-dark-border rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="p-3 border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-dark-accent" />
          <span className="font-semibold text-sm">DevTools</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-dark-text-secondary hover:text-dark-text"
        >
          ✕
        </button>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        <div className="text-xs text-dark-text-secondary mb-2">DADOS MOCKADOS</div>
        
        <button
          onClick={handleLoadMockData}
          className="w-full button flex items-center gap-2 justify-start"
        >
          <Database size={14} />
          Carregar Mock Completo
        </button>

        <button
          onClick={handleOpenMockFile}
          className="w-full button flex items-center gap-2 justify-start"
        >
          📄 Abrir arquivo mock
        </button>

        <div className="text-xs text-dark-text-secondary mb-2 mt-4">TESTES</div>

        <button
          onClick={handleAddTestMessage}
          className="w-full button flex items-center gap-2 justify-start"
        >
          💬 Adicionar mensagem
        </button>

        <button
          onClick={handleAddTerminalOutput}
          className="w-full button flex items-center gap-2 justify-start"
        >
          🖥️ Output no terminal
        </button>

        <button
          onClick={handleAddAgentAction}
          className="w-full button flex items-center gap-2 justify-start"
        >
          🤖 Adicionar ação do agente
        </button>

        <div className="text-xs text-dark-text-secondary mb-2 mt-4">LIMPEZA</div>

        <button
          onClick={clearTerminalOutput}
          className="w-full button flex items-center gap-2 justify-start text-dark-error"
        >
          <Trash2 size={14} />
          Limpar terminal
        </button>

        <div className="text-xs text-dark-text-secondary mt-4 p-2 bg-dark-bg rounded">
          💡 Use este painel para testar a UI sem o backend
        </div>
      </div>
    </div>
  );
};

export default DevTools;
