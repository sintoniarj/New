from fastapi import APIRouter, HTTPException, Query
from app.services.file_manager import FileManager
from app.models.schemas import (
    FileReadRequest,
    FileWriteRequest,
    FileListRequest,
    FileListResponse,
    FileContentResponse
)
from app.core.logging import log

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/list")
async def list_files(
    session_id: str = Query(..., description="ID da sessão"),
    path: str = Query(".", description="Caminho do diretório")
):
    """Lista arquivos e diretórios"""
    try:
        file_manager = FileManager(session_id)
        result = await file_manager.list_files(path)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error'))
        
        return {
            "success": True,
            "tree": result['tree']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        log.bind(type="system").error(f"Erro ao listar arquivos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/read")
async def read_file(
    session_id: str = Query(..., description="ID da sessão"),
    path: str = Query(..., description="Caminho do arquivo")
):
    """Lê o conteúdo de um arquivo"""
    try:
        file_manager = FileManager(session_id)
        result = await file_manager.read_file(path)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error'))
        
        return FileContentResponse(
            path=path,
            content=result['content']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        log.bind(type="system").error(f"Erro ao ler arquivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/write")
async def write_file(request: FileWriteRequest, session_id: str = Query(...)):
    """Cria ou sobrescreve um arquivo"""
    try:
        file_manager = FileManager(session_id)
        result = await file_manager.write_file(request.path, request.content)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error'))
        
        return {
            "success": True,
            "path": request.path,
            "size": result['size']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        log.bind(type="system").error(f"Erro ao escrever arquivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete")
async def delete_file(
    session_id: str = Query(..., description="ID da sessão"),
    path: str = Query(..., description="Caminho do arquivo")
):
    """Deleta um arquivo ou diretório"""
    try:
        file_manager = FileManager(session_id)
        result = await file_manager.delete_file(path)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error'))
        
        return {
            "success": True,
            "path": path
        }
    
    except HTTPException:
        raise
    except Exception as e:
        log.bind(type="system").error(f"Erro ao deletar arquivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))
