import { useStore } from '../store';
import { Terminal as TerminalIcon, FileText } from 'lucide-react';
import Terminal from './Terminal';
import clsx from 'clsx';

const BottomPanel = () => {
  const { bottomTab, setBottomTab, logs } = useStore();

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal', icon: TerminalIcon },
    { id: 'logs' as const, label: 'Logs', icon: FileText },
  ];

  return (
    <div className="h-64 border-t border-dark-border flex flex-col bg-dark-surface">
      {/* Tabs */}
      <div className="flex items-center gap-2 px-2 border-b border-dark-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setBottomTab(tab.id)}
              className={clsx(
                'tab flex items-center gap-2',
                bottomTab === tab.id && 'tab-active'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {bottomTab === 'terminal' && <Terminal />}
        {bottomTab === 'logs' && (
          <div className="h-full overflow-y-auto p-4 bg-dark-bg font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-dark-text-secondary">Nenhum log registrado</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-dark-text-secondary">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;
