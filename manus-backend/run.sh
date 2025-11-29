#!/bin/bash

# Script para executar o servidor MANUS

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Executar servidor com reload automático
python -m uvicorn app.main:app \
    --reload \
    --host 0.0.0.0 \
    --port 8000 \
    --log-level info
