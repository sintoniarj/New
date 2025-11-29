from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, files
from app.core.config import settings
from app.core.logging import log

# Criar aplicação
app = FastAPI(
    title="MANUS API",
    description="Backend para plataforma de desenvolvimento assistido com Claude Sonnet 4.5",
    version="1.0.0",
    debug=settings.debug
)

# CORS - permitir frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite e React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluir routers
app.include_router(chat.router)
app.include_router(files.router)


@app.on_event("startup")
async def startup_event():
    """Executado ao iniciar o servidor"""
    log.bind(type="system").info("=" * 60)
    log.bind(type="system").info("🚀 MANUS Backend iniciando...")
    log.bind(type="system").info(f"📍 Modelo: {settings.claude_model}")
    log.bind(type="system").info(f"📁 Workspace: {settings.workspace_dir}")
    log.bind(type="system").info(f"🔧 Debug: {settings.debug}")
    log.bind(type="system").info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Executado ao desligar o servidor"""
    log.bind(type="system").info("👋 MANUS Backend encerrando...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MANUS API",
        "version": "1.0.0",
        "status": "online",
        "model": settings.claude_model
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "model": settings.claude_model,
        "workspace": settings.workspace_dir
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
