import { useState } from 'react';
import { useStore } from '../store';
import { 
  FolderOpen, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  Play,
  TestTube,
  Rocket
} from 'lucide-react';
import { FileNode } from '../types';

const FileTreeItem = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const { openFile, activeFile, setActiveFile } = useStore();

  const handleClick = async () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      // Simular carregamento do arquivo
      // Em produção, faria fetch do conteúdo via API
      openFile(node.path, `// Conteúdo de ${node.name}\n`);
      setActiveFile(node.path);
    }
  };

  const isActive = activeFile === node.path;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-dark-hover transition-colors ${
          isActive ? 'bg-dark-accent/20 text-dark-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' && (
          <span className="text-dark-text-secondary">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        <span className="text-dark-text-secondary">
          {node.type === 'directory' ? <FolderOpen size={16} /> : <File size={16} />}
        </span>
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { currentProject, fileTree } = useStore();

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="text-xs text-dark-text-secondary mb-2">PROJETO</div>
        <div className="text-sm font-medium">
          {currentProject ? currentProject.name : 'Sem projeto'}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-dark-border">
        <div className="text-xs text-dark-text-secondary mb-2 px-2">AÇÕES RÁPIDAS</div>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-dark-hover rounded transition-colors">
            <Plus size={14} />
            Novo arquivo
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-dark-hover rounded transition-colors">
            <Play size={14} />
            Executar
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-dark-hover rounded transition-colors">
            <TestTube size={14} />
            Testar
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-dark-hover rounded transition-colors">
            <Rocket size={14} />
            Deploy
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-xs text-dark-text-secondary mb-2 px-4 pt-2">ARQUIVOS</div>
        {fileTree.length > 0 ? (
          <div>
            {fileTree.map((node) => (
              <FileTreeItem key={node.path} node={node} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-dark-text-secondary">
            Nenhum arquivo no projeto
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
