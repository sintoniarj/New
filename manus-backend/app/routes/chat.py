from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.agent_orchestrator import AgentOrchestrator
from app.core.logging import log
import json
import uuid

router = APIRouter()

# Gerenciar sessões ativas
active_sessions = {}


@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint para chat com streaming"""
    
    await websocket.accept()
    
    # Criar sessão
    session_id = str(uuid.uuid4())
    orchestrator = AgentOrchestrator(session_id)
    active_sessions[session_id] = orchestrator
    
    log.bind(type="system").info(f"Nova sessão WebSocket: {session_id}")
    
    try:
        # Enviar confirmação de conexão
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id
        })
        
        while True:
            # Receber mensagem do cliente
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            msg_type = message_data.get("type")
            
            if msg_type == "chat":
                user_message = message_data.get("content", "")
                mode = message_data.get("mode", "assistant")
                
                log.bind(type="agent").info(f"[{session_id}] Mensagem recebida (modo: {mode})")
                
                # Processar mensagem com streaming
                try:
                    async for event in orchestrator.process_message(user_message, mode):
                        event_type = event.get("type")
                        
                        # Enviar chunk de texto
                        if event_type == "message_chunk":
                            await websocket.send_json({
                                "type": "message_chunk",
                                "content": event.get("content")
                            })
                        
                        # Tool use iniciado
                        elif event_type == "tool_use_start":
                            await websocket.send_json({
                                "type": "tool_use_start",
                                "tool_name": event.get("tool_name")
                            })
                        
                        # Ação do agente
                        elif event_type == "agent_action":
                            await websocket.send_json({
                                "type": "agent_action",
                                "action": event.get("action")
                            })
                        
                        # Output do terminal
                        elif event_type == "terminal_output":
                            await websocket.send_json({
                                "type": "terminal_output",
                                "output": event.get("output")
                            })
                        
                        # Mensagem completa
                        elif event_type == "message_complete":
                            await websocket.send_json({
                                "type": "message_complete",
                                "content": event.get("content")
                            })
                        
                        # Erro
                        elif event_type == "error":
                            await websocket.send_json({
                                "type": "error",
                                "error": event.get("error")
                            })
                
                except Exception as e:
                    log.bind(type="system").error(f"Erro ao processar mensagem: {e}")
                    await websocket.send_json({
                        "type": "error",
                        "error": str(e)
                    })
            
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        log.bind(type="system").info(f"Cliente desconectado: {session_id}")
    except Exception as e:
        log.bind(type="system").error(f"Erro no WebSocket: {e}")
    finally:
        # Limpar sessão
        if session_id in active_sessions:
            del active_sessions[session_id]
        
        log.bind(type="system").info(f"Sessão encerrada: {session_id}")
