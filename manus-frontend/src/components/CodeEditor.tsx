import { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useStore } from '../store';
import { FileCode } from 'lucide-react';

const CodeEditor = () => {
  const { activeFile, openFiles, updateFileContent } = useStore();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configurar tema dark customizado
    monaco.editor.defineTheme('manus-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#8b949e',
        'editor.selectionBackground': '#1f6feb40',
        'editor.inactiveSelectionBackground': '#1f6feb20',
      },
    });

    monaco.editor.setTheme('manus-dark');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value);
    }
  };

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      json: 'json',
      html: 'html',
      css: 'css',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      sh: 'shell',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-dark-text-secondary">
        <div className="text-center">
          <FileCode size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum arquivo aberto</p>
          <p className="text-sm mt-2">Selecione um arquivo na sidebar para começar</p>
        </div>
      </div>
    );
  }

  const content = openFiles.get(activeFile) || '';
  const language = getLanguage(activeFile);

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontLigatures: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
