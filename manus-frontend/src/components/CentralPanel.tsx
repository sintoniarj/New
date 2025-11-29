import { useStore } from '../store';
import { Code2, Map, History } from 'lucide-react';
import CodeEditor from './CodeEditor';
import PlanView from './PlanView';
import HistoryView from './HistoryView';
import clsx from 'clsx';

const CentralPanel = () => {
  const { centralTab, setCentralTab, openFiles, activeFile } = useStore();

  const tabs = [
    { id: 'editor' as const, label: 'Editor', icon: Code2 },
    { id: 'plan' as const, label: 'Plano', icon: Map },
    { id: 'history' as const, label: 'Histórico', icon: History },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-dark-surface border-b border-dark-border px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCentralTab(tab.id)}
              className={clsx(
                'tab flex items-center gap-2',
                centralTab === tab.id && 'tab-active'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}

        {/* Open files tabs */}
        {centralTab === 'editor' && Array.from(openFiles.keys()).length > 0 && (
          <div className="flex-1 flex items-center gap-1 ml-4 overflow-x-auto">
            {Array.from(openFiles.keys()).map((path) => {
              const fileName = path.split('/').pop() || path;
              return (
                <button
                  key={path}
                  onClick={() => useStore.getState().setActiveFile(path)}
                  className={clsx(
                    'px-3 py-2 text-sm rounded-t transition-colors flex items-center gap-2',
                    activeFile === path
                      ? 'bg-dark-bg text-dark-text'
                      : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text'
                  )}
                >
                  {fileName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useStore.getState().closeFile(path);
                    }}
                    className="hover:text-dark-error"
                  >
                    ×
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-dark-bg">
        {centralTab === 'editor' && <CodeEditor />}
        {centralTab === 'plan' && <PlanView />}
        {centralTab === 'history' && <HistoryView />}
      </div>
    </div>
  );
};

export default CentralPanel;
