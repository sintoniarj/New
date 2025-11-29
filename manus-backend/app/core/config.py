from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Configurações da aplicação carregadas do .env"""
    
    # Anthropic
    anthropic_api_key: str = Field(..., alias="ANTHROPIC_API_KEY")
    claude_model: str = Field(default="claude-sonnet-4-20250514", alias="CLAUDE_MODEL")
    claude_max_tokens: int = Field(default=8000, alias="CLAUDE_MAX_TOKENS")
    
    # Servidor
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # Workspaces
    workspace_dir: str = Field(default="/tmp/manus-workspaces", alias="WORKSPACE_DIR")
    
    # Limites
    max_command_timeout: int = Field(default=60, alias="MAX_COMMAND_TIMEOUT")
    max_output_size: int = Field(default=100000, alias="MAX_OUTPUT_SIZE")
    max_file_size: int = Field(default=10485760, alias="MAX_FILE_SIZE")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Instância global
settings = Settings()
