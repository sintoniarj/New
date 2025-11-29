import { useStore } from '../store';
import { Terminal, FileEdit, FileText, Map, History as HistoryIcon } from 'lucide-react';
import { AgentAction } from '../types';

const ActionIcon = ({ type }: { type: AgentAction['type'] }) => {
  switch (type) {
    case 'command':
      return <Terminal size={16} className="text-dark-accent" />;
    case 'file_write':
      return <FileEdit size={16} className="text-dark-success" />;
    case 'file_read':
      return <FileText size={16} className="text-dark-warning" />;
    case 'plan':
      return <Map size={16} className="text-purple-500" />;
    default:
      return null;
  }
};

const HistoryView = () => {
  const { agentActions } = useStore();

  if (agentActions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-dark-text-secondary">
        <div className="text-center">
          <HistoryIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma ação registrada</p>
          <p className="text-sm mt-2">As ações do agente aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-xl font-semibold mb-6 text-dark-text flex items-center gap-2">
        <HistoryIcon size={24} />
        Histórico de Ações
      </h2>

      <div className="space-y-3">
        {agentActions.map((action) => (
          <div
            key={action.id}
            className="panel p-4 hover:border-dark-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <ActionIcon type={action.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-dark-text-secondary">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      action.status === 'success'
                        ? 'bg-dark-success/20 text-dark-success'
                        : action.status === 'running'
                        ? 'bg-dark-accent/20 text-dark-accent'
                        : 'bg-dark-error/20 text-dark-error'
                    }`}
                  >
                    {action.status === 'success'
                      ? 'Sucesso'
                      : action.status === 'running'
                      ? 'Executando'
                      : 'Erro'}
                  </span>
                </div>
                <p className="text-sm text-dark-text mb-2">{action.description}</p>
                {action.output && (
                  <div className="bg-dark-bg rounded p-2 mt-2">
                    <pre className="text-xs text-dark-text-secondary overflow-x-auto whitespace-pre-wrap">
                      {action.output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
