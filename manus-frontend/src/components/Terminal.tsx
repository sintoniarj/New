import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useStore } from '../store';
import '@xterm/xterm/css/xterm.css';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { terminalOutput } = useStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Criar terminal
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#58a6ff',
        black: '#0d1117',
        red: '#f85149',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#76e3ea',
        white: '#e6edf3',
        brightBlack: '#6e7681',
        brightRed: '#ff7b72',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#b3f0ff',
        brightWhite: '#f0f6fc',
      },
      allowTransparency: false,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Mensagem inicial
    xterm.writeln('MANUS Terminal v1.0');
    xterm.writeln('Aguardando comandos do agente...\n');

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      xterm.dispose();
    };
  }, []);

  // Atualizar output do terminal
  useEffect(() => {
    if (xtermRef.current && terminalOutput) {
      // Pegar apenas a nova parte do output
      const lines = terminalOutput.split('\n');
      const lastLine = lines[lines.length - 1];
      
      if (lastLine) {
        xtermRef.current.write(lastLine + '\r\n');
      }
    }
  }, [terminalOutput]);

  return (
    <div ref={terminalRef} className="h-full w-full p-2" />
  );
};

export default Terminal;
