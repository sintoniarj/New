import { useEffect } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import CentralPanel from './components/CentralPanel';
import BottomPanel from './components/BottomPanel';
import ChatPanel from './components/ChatPanel';
import DevTools from './components/DevTools';

function App() {
  const { setWebSocket, addLog } = useStore();

  useEffect(() => {
    // Conectar WebSocket
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws/chat');
      
      ws.onopen = () => {
        addLog('✓ Conectado ao backend');
        setWebSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addLog('✗ Erro na conexão WebSocket');
      };

      ws.onclose = () => {
        addLog('⚠ Desconectado do backend');
        setWebSocket(null);
        // Tentar reconectar após 3 segundos
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      const ws = useStore.getState().ws;
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    const { addMessage, setIsStreaming, setPlanSteps, addAgentAction, appendTerminalOutput } = useStore.getState();

    switch (data.type) {
      case 'message_chunk':
        // Streaming de mensagem
        // TODO: implementar acúmulo de chunks
        break;
      
      case 'message_complete':
        addMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content,
          timestamp: Date.now(),
        });
        setIsStreaming(false);
        break;
      
      case 'plan':
        setPlanSteps(data.steps);
        break;
      
      case 'agent_action':
        addAgentAction(data.action);
        break;
      
      case 'terminal_output':
        appendTerminalOutput(data.output);
        break;
      
      default:
        console.warn('Tipo de mensagem desconhecido:', data.type);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-12 bg-dark-surface border-b border-dark-border flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="ml-4 text-lg font-semibold text-dark-text">
          MANUS <span className="text-dark-text-secondary text-sm ml-2">AI Dev Platform</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar esquerda */}
        <Sidebar />

        {/* Área central + painel inferior */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CentralPanel />
          <BottomPanel />
        </div>

        {/* Chat direita */}
        <ChatPanel />
      </div>

      {/* DevTools - apenas em desenvolvimento */}
      {import.meta.env.DEV && <DevTools />}
    </div>
  );
}

export default App;
