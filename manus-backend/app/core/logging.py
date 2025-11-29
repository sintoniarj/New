import sys
from loguru import logger
from pathlib import Path


def setup_logging(log_dir: str = "logs"):
    """Configura sistema de logging com loguru"""
    
    # Criar diretório de logs
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    
    # Remover handler padrão
    logger.remove()
    
    # Console - apenas INFO+
    logger.add(
        sys.stdout,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level="INFO",
        colorize=True,
    )
    
    # Agent log - ações do agente
    logger.add(
        f"{log_dir}/agent.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function} - {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="7 days",
        filter=lambda record: "agent" in record["extra"].get("type", ""),
    )
    
    # System log - infra e erros
    logger.add(
        f"{log_dir}/system.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="7 days",
        filter=lambda record: "system" in record["extra"].get("type", ""),
    )
    
    # Exec log - comandos executados
    logger.add(
        f"{log_dir}/exec.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {message}",
        level="INFO",
        rotation="5 MB",
        retention="3 days",
        filter=lambda record: "exec" in record["extra"].get("type", ""),
    )
    
    return logger


# Logger global
log = setup_logging()
