import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Send, User, Bot, Settings, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const ChatPanel = () => {
  const {
    messages,
    isStreaming,
    agentMode,
    setAgentMode,
    sendMessage,
  } = useStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-96 bg-dark-surface border-l border-dark-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-dark-accent" />
            <h3 className="font-semibold">Claude Sonnet 4.5</h3>
          </div>
          <button className="text-dark-text-secondary hover:text-dark-text">
            <Settings size={18} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setAgentMode('assistant')}
            className={clsx(
              'flex-1 px-3 py-2 rounded text-sm font-medium transition-colors',
              agentMode === 'assistant'
                ? 'bg-dark-accent text-white'
                : 'bg-dark-hover text-dark-text-secondary hover:text-dark-text'
            )}
          >
            🧠 Assistente
          </button>
          <button
            onClick={() => setAgentMode('agent')}
            className={clsx(
              'flex-1 px-3 py-2 rounded text-sm font-medium transition-colors',
              agentMode === 'agent'
                ? 'bg-dark-accent text-white'
                : 'bg-dark-hover text-dark-text-secondary hover:text-dark-text'
            )}
          >
            🤖 Agente
          </button>
        </div>

        <p className="text-xs text-dark-text-secondary mt-2">
          {agentMode === 'assistant'
            ? 'Modo conversa: apenas responde perguntas'
            : 'Modo agente: pode criar/editar arquivos e executar comandos'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-dark-text-secondary">
            <div>
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">Olá! Sou o Claude Sonnet 4.5</p>
              <p className="text-sm">
                {agentMode === 'assistant'
                  ? 'Como posso ajudar você hoje?'
                  : 'Pronto para criar e executar código. Qual projeto vamos fazer?'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div
                  className={clsx(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'user'
                      ? 'bg-dark-accent'
                      : 'bg-dark-hover'
                  )}
                >
                  {message.role === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                <div
                  className={clsx(
                    'flex-1 panel p-3',
                    message.role === 'user'
                      ? 'bg-dark-accent/10'
                      : ''
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs text-dark-text-secondary mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-hover flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="flex-1 panel p-3">
                  <Loader2 size={16} className="animate-spin text-dark-accent" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              agentMode === 'assistant'
                ? 'Digite sua pergunta...'
                : 'Descreva o que deseja criar...'
            }
            className="input flex-1 text-sm"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="button-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
