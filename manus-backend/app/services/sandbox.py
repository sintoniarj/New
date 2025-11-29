import asyncio
import time
from typing import Dict, Any, List
from pathlib import Path
from app.core.config import settings
from app.core.logging import log


# Comandos perigosos bloqueados
BLOCKED_COMMANDS = [
    "rm -rf /",
    "dd if=",
    "mkfs",
    ":(){ :|:& };:",  # Fork bomb
    "> /dev/sda",
    "chmod -R 777 /",
]


class SandboxExecutor:
    """Executa comandos em ambiente isolado (subprocess por enquanto, Docker depois)"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.workspace_root = Path(settings.workspace_dir) / session_id
        self.workspace_root.mkdir(parents=True, exist_ok=True)
    
    def _is_command_safe(self, command: str) -> bool:
        """
        Verifica se o comando é seguro
        
        Args:
            command: Comando a verificar
            
        Returns:
            True se seguro, False caso contrário
        """
        command_lower = command.lower().strip()
        
        for blocked in BLOCKED_COMMANDS:
            if blocked in command_lower:
                return False
        
        # Bloqueios adicionais
        dangerous_patterns = [
            "rm -rf",
            "sudo ",
            "su -",
            "/etc/",
            "/sys/",
            "/proc/",
            "/dev/",
        ]
        
        for pattern in dangerous_patterns:
            if pattern in command_lower:
                return False
        
        return True
    
    async def run_command(
        self,
        command: str,
        cwd: str = ".",
        timeout: int = None
    ) -> Dict[str, Any]:
        """
        Executa um comando no sandbox
        
        Args:
            command: Comando a executar
            cwd: Diretório de trabalho (relativo ao workspace)
            timeout: Timeout em segundos (opcional)
            
        Returns:
            Resultado da execução com stdout, stderr, returncode
        """
        start_time = time.time()
        
        try:
            # Validar segurança
            if not self._is_command_safe(command):
                log.bind(type="system").warning(f"Comando bloqueado por segurança: {command}")
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": "ERRO: Comando bloqueado por política de segurança",
                    "returncode": 1,
                    "duration": 0
                }
            
            # Resolver diretório de trabalho
            work_dir = (self.workspace_root / cwd).resolve()
            
            # Garantir que está dentro do workspace
            if not str(work_dir).startswith(str(self.workspace_root)):
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": "ERRO: Diretório fora do workspace",
                    "returncode": 1,
                    "duration": 0
                }
            
            # Criar diretório se não existir
            work_dir.mkdir(parents=True, exist_ok=True)
            
            # Timeout padrão
            if timeout is None:
                timeout = settings.max_command_timeout
            
            log.bind(type="exec").info(f"$ {command}")
            log.bind(type="exec").info(f"CWD: {work_dir}")
            
            # Executar comando
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(work_dir),
                env={
                    **dict(os.environ),
                    "PYTHONUNBUFFERED": "1",
                    "FORCE_COLOR": "1",
                }
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                
                duration = time.time() - start_time
                log.bind(type="exec").error(f"Comando timeout após {timeout}s")
                
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": f"ERRO: Comando excedeu timeout de {timeout}s",
                    "returncode": 124,  # Código padrão de timeout
                    "duration": duration
                }
            
            # Decodificar output
            stdout_str = stdout.decode('utf-8', errors='replace')
            stderr_str = stderr.decode('utf-8', errors='replace')
            
            # Truncar se muito grande
            if len(stdout_str) > settings.max_output_size:
                stdout_str = stdout_str[:settings.max_output_size] + "\n... (truncado)"
            if len(stderr_str) > settings.max_output_size:
                stderr_str = stderr_str[:settings.max_output_size] + "\n... (truncado)"
            
            duration = time.time() - start_time
            
            log.bind(type="exec").info(f"Retornou em {duration:.2f}s com código {process.returncode}")
            
            if stdout_str:
                log.bind(type="exec").debug(f"STDOUT:\n{stdout_str}")
            if stderr_str:
                log.bind(type="exec").debug(f"STDERR:\n{stderr_str}")
            
            return {
                "success": process.returncode == 0,
                "stdout": stdout_str,
                "stderr": stderr_str,
                "returncode": process.returncode,
                "duration": duration
            }
            
        except Exception as e:
            duration = time.time() - start_time
            log.bind(type="system").error(f"Erro ao executar comando: {e}")
            
            return {
                "success": False,
                "stdout": "",
                "stderr": f"ERRO: {str(e)}",
                "returncode": 1,
                "duration": duration
            }


import os  # Import necessário
