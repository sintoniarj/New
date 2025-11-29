# Dockerfile para sandbox de execução
# Este container será usado para executar código de forma isolada

FROM ubuntu:22.04

# Evitar prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Instalar ferramentas essenciais
RUN apt-get update && apt-get install -y \
    # Compiladores e interpreters
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-17-jdk \
    golang-go \
    rustc \
    cargo \
    gcc \
    g++ \
    make \
    # Ferramentas de build
    git \
    curl \
    wget \
    vim \
    nano \
    # Utilitários
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar ferramentas Python comuns
RUN pip3 install --no-cache-dir \
    pytest \
    black \
    flake8 \
    mypy \
    requests \
    fastapi \
    uvicorn

# Criar diretório de trabalho
WORKDIR /workspace

# Usuário não-root para segurança
RUN useradd -m -s /bin/bash coder
USER coder

# Comando padrão
CMD ["/bin/bash"]
