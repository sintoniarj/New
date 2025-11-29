import os
import aiofiles
from pathlib import Path
from typing import List, Dict, Any
from app.core.config import settings
from app.core.logging import log
from app.models.schemas import FileNode


class FileManager:
    """Gerencia operações de arquivo no workspace"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.workspace_root = Path(settings.workspace_dir) / session_id
        self.workspace_root.mkdir(parents=True, exist_ok=True)
        
    def _resolve_path(self, path: str) -> Path:
        """
        Resolve e valida um caminho relativo ao workspace
        
        Args:
            path: Caminho relativo
            
        Returns:
            Path absoluto dentro do workspace
            
        Raises:
            ValueError: Se tentar acessar fora do workspace
        """
        # Resolver caminho
        full_path = (self.workspace_root / path).resolve()
        
        # Garantir que está dentro do workspace
        if not str(full_path).startswith(str(self.workspace_root)):
            raise ValueError(f"Acesso negado: caminho fora do workspace: {path}")
        
        return full_path
    
    async def write_file(self, path: str, content: str) -> Dict[str, Any]:
        """
        Cria ou sobrescreve um arquivo
        
        Args:
            path: Caminho do arquivo
            content: Conteúdo a escrever
            
        Returns:
            Info sobre a operação
        """
        try:
            file_path = self._resolve_path(path)
            
            # Criar diretórios pais se necessário
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Verificar tamanho
            if len(content.encode('utf-8')) > settings.max_file_size:
                raise ValueError(f"Arquivo muito grande (máx: {settings.max_file_size} bytes)")
            
            # Escrever arquivo
            async with aiofiles.open(file_path, 'w', encoding='utf-8') as f:
                await f.write(content)
            
            log.bind(type="agent").info(f"Arquivo escrito: {path} ({len(content)} chars)")
            
            return {
                "success": True,
                "path": path,
                "size": len(content)
            }
            
        except Exception as e:
            log.bind(type="system").error(f"Erro ao escrever arquivo {path}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def read_file(self, path: str) -> Dict[str, Any]:
        """
        Lê o conteúdo de um arquivo
        
        Args:
            path: Caminho do arquivo
            
        Returns:
            Conteúdo do arquivo ou erro
        """
        try:
            file_path = self._resolve_path(path)
            
            if not file_path.exists():
                return {
                    "success": False,
                    "error": f"Arquivo não encontrado: {path}"
                }
            
            if not file_path.is_file():
                return {
                    "success": False,
                    "error": f"Não é um arquivo: {path}"
                }
            
            # Ler arquivo
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                content = await f.read()
            
            log.bind(type="agent").info(f"Arquivo lido: {path} ({len(content)} chars)")
            
            return {
                "success": True,
                "path": path,
                "content": content
            }
            
        except Exception as e:
            log.bind(type="system").error(f"Erro ao ler arquivo {path}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def list_files(self, path: str = ".") -> Dict[str, Any]:
        """
        Lista arquivos e diretórios
        
        Args:
            path: Caminho do diretório
            
        Returns:
            Lista de arquivos e diretórios
        """
        try:
            dir_path = self._resolve_path(path)
            
            if not dir_path.exists():
                return {
                    "success": False,
                    "error": f"Diretório não encontrado: {path}"
                }
            
            if not dir_path.is_dir():
                return {
                    "success": False,
                    "error": f"Não é um diretório: {path}"
                }
            
            # Construir árvore
            def build_tree(p: Path) -> FileNode:
                relative = p.relative_to(self.workspace_root)
                
                if p.is_file():
                    return FileNode(
                        name=p.name,
                        path=str(relative),
                        type="file"
                    )
                else:
                    children = []
                    try:
                        for item in sorted(p.iterdir()):
                            # Ignorar arquivos ocultos
                            if item.name.startswith('.'):
                                continue
                            children.append(build_tree(item))
                    except PermissionError:
                        pass
                    
                    return FileNode(
                        name=p.name,
                        path=str(relative),
                        type="directory",
                        children=children if children else None
                    )
            
            tree = build_tree(dir_path)
            
            return {
                "success": True,
                "tree": tree.model_dump()
            }
            
        except Exception as e:
            log.bind(type="system").error(f"Erro ao listar arquivos em {path}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_file(self, path: str) -> Dict[str, Any]:
        """
        Deleta um arquivo
        
        Args:
            path: Caminho do arquivo
            
        Returns:
            Info sobre a operação
        """
        try:
            file_path = self._resolve_path(path)
            
            if not file_path.exists():
                return {
                    "success": False,
                    "error": f"Arquivo não encontrado: {path}"
                }
            
            if file_path.is_file():
                file_path.unlink()
            else:
                import shutil
                shutil.rmtree(file_path)
            
            log.bind(type="agent").info(f"Arquivo deletado: {path}")
            
            return {
                "success": True,
                "path": path
            }
            
        except Exception as e:
            log.bind(type="system").error(f"Erro ao deletar arquivo {path}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
