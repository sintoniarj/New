from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


# ==================== Chat ====================

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    mode: Literal["assistant", "agent"] = "assistant"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: ChatMessage
    session_id: str


# ==================== Agent ====================

class AgentStepRequest(BaseModel):
    session_id: str
    action: str
    parameters: dict = Field(default_factory=dict)


class PlanStep(BaseModel):
    id: str
    title: str
    status: Literal["pending", "in-progress", "completed", "error"]
    description: Optional[str] = None


class AgentAction(BaseModel):
    id: str
    type: Literal["command", "file_write", "file_read", "plan"]
    description: str
    timestamp: datetime
    status: Literal["running", "success", "error"]
    output: Optional[str] = None


# ==================== Files ====================

class FileNode(BaseModel):
    name: str
    path: str
    type: Literal["file", "directory"]
    children: Optional[List["FileNode"]] = None


class FileReadRequest(BaseModel):
    path: str


class FileWriteRequest(BaseModel):
    path: str
    content: str


class FileListRequest(BaseModel):
    path: str = "."


class FileListResponse(BaseModel):
    files: List[FileNode]


class FileContentResponse(BaseModel):
    path: str
    content: str


# ==================== Commands ====================

class CommandRequest(BaseModel):
    command: str
    cwd: str = "."
    timeout: int = 60


class CommandResponse(BaseModel):
    stdout: str
    stderr: str
    returncode: int
    duration: float


# ==================== WebSocket ====================

class WSMessage(BaseModel):
    type: Literal[
        "chat",
        "message_chunk", 
        "message_complete",
        "plan",
        "agent_action",
        "terminal_output",
        "error"
    ]
    content: Optional[str] = None
    mode: Optional[Literal["assistant", "agent"]] = None
    steps: Optional[List[PlanStep]] = None
    action: Optional[AgentAction] = None
    output: Optional[str] = None
    error: Optional[str] = None


# Permitir referências recursivas
FileNode.model_rebuild()
