import anthropic
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import log


# System prompt para o modo MANUS
MANUS_SYSTEM_PROMPT = """Você é um agente de desenvolvimento de software SENIOR, chamado MANUS-SONNET, integrado a uma plataforma web de programação assistida com terminal virtual e filesystem.

OBJETIVO GERAL
- Criar, manter e evoluir projetos de software completos, em qualquer linguagem (Python, Node.js/TypeScript, Go, Rust, C#, Java, PHP, C/C++, etc.).
- Planejar o trabalho em passos claros.
- Escrever código de alta qualidade, testável e organizado.
- Utilizar as ferramentas disponíveis (filesystem e terminal sandbox) para criar arquivos, executar comandos, rodar testes e depurar erros.
- Explicar sempre o que está fazendo, de forma concisa, para que o usuário acompanhe o raciocínio.

AMBIENTE
- Você NÃO tem acesso direto à internet, ao sistema operacional real ou a qualquer recurso externo.
- Você interage com o mundo APENAS por meio das ferramentas expostas pelo backend:
  - run_command: executa comandos em um terminal Linux sandbox, dentro do diretório do projeto.
  - write_file: cria ou sobrescreve arquivos com conteúdo textual.
  - read_file: lê arquivos existentes.
  - list_files: lista arquivos e pastas.
- Todo comando é executado em um ambiente isolado preparado para desenvolvimento (compiladores, interpreters, gerenciadores de pacotes, etc.).

ESTILO DE TRABALHO
1. Sempre que receber uma nova tarefa importante:
   - Faça um PLANO EM TÓPICOS antes de começar a executar.
   - O plano deve ser curto, mas cobrindo:
     - objetivo
     - etapas principais
     - arquivos que pretende criar/alterar
     - comandos que pretende rodar.
   - Esse plano será exibido no painel de "Mapa Mental" para o usuário.

2. Quando for escrever código:
   - Prefira criar arquivos completos usando `write_file`, em vez de mandar pedaços soltos de código.
   - Organize o projeto de forma padrão para a tecnologia escolhida.
   - Comente pontos importantes do código (apenas o necessário).

3. Quando precisar rodar algo:
   - Use `run_command` com comandos CURTOS e bem definidos.
   - Leia sempre o output do comando e, se houver erro, analise-o e proponha correção imediatamente.

4. Transparência:
   - Sempre explique, em linguagem natural, o que está prestes a fazer.
   - Mantenha o usuário ciente do progresso, em pequenos checkpoints.

5. Qualidade de código:
   - Utilize boas práticas da linguagem/framework escolhido.
   - Evite dependências desnecessárias.
   - Escreva código limpo, com nomes claros de variáveis, funções e classes.

6. Segurança e limites:
   - Nunca tente acessar diretórios fora do workspace fornecido.
   - Nunca use comandos destrutivos como `rm -rf /` ou similares.
   - Não execute comandos de rede ou que tentem acessar recursos externos não previstos.

FORMATO DAS RESPOSTAS
- Use mensagens bem estruturadas, em português, com seções como:
  - `Plano`
  - `Ações executadas`
  - `Próximos passos`
- Seja objetivo. Evite texto excessivo, mas não omita detalhes importantes.

Você é focado em produtividade, clareza, estabilidade e segurança."""


class AnthropicClient:
    """Cliente para interagir com a API Anthropic (Claude)"""
    
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.claude_model
        self.max_tokens = settings.claude_max_tokens
        
    def get_tools(self) -> List[Dict[str, Any]]:
        """Define as ferramentas disponíveis para o agente"""
        return [
            {
                "name": "run_command",
                "description": "Executa um comando shell no terminal sandbox do projeto. Use para instalar dependências, rodar testes, executar aplicações, etc.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "command": {
                            "type": "string",
                            "description": "O comando a ser executado (ex: 'npm install', 'python main.py')"
                        },
                        "cwd": {
                            "type": "string",
                            "description": "Diretório de trabalho (opcional, padrão: '.')"
                        }
                    },
                    "required": ["command"]
                }
            },
            {
                "name": "write_file",
                "description": "Cria ou sobrescreve um arquivo com o conteúdo fornecido",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Caminho do arquivo relativo ao workspace"
                        },
                        "content": {
                            "type": "string",
                            "description": "Conteúdo completo do arquivo"
                        }
                    },
                    "required": ["path", "content"]
                }
            },
            {
                "name": "read_file",
                "description": "Lê o conteúdo de um arquivo existente",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Caminho do arquivo relativo ao workspace"
                        }
                    },
                    "required": ["path"]
                }
            },
            {
                "name": "list_files",
                "description": "Lista arquivos e diretórios em um caminho específico",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Caminho do diretório (opcional, padrão: '.')"
                        }
                    },
                    "required": []
                }
            }
        ]
    
    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        use_tools: bool = False
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Chat com streaming de resposta
        
        Args:
            messages: Lista de mensagens no formato {"role": "user/assistant", "content": "..."}
            use_tools: Se True, permite o uso de ferramentas (modo agente)
        
        Yields:
            Chunks da resposta em formato dict
        """
        try:
            log.bind(type="agent").info(f"Iniciando chat stream (tools={use_tools})")
            
            kwargs = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "messages": messages,
            }
            
            # Adicionar system prompt e tools se modo agente
            if use_tools:
                kwargs["system"] = MANUS_SYSTEM_PROMPT
                kwargs["tools"] = self.get_tools()
            
            # Stream de resposta usando with (não async with)
            with self.client.messages.stream(**kwargs) as stream:
                for event in stream:
                    # Texto sendo gerado
                    if hasattr(event, 'type'):
                        if event.type == 'content_block_delta':
                            if hasattr(event.delta, 'text'):
                                yield {
                                    "type": "text_delta",
                                    "text": event.delta.text
                                }
                        
                        # Tool use request
                        elif event.type == 'content_block_start':
                            if hasattr(event.content_block, 'type'):
                                if event.content_block.type == 'tool_use':
                                    yield {
                                        "type": "tool_use_start",
                                        "tool_name": event.content_block.name,
                                        "tool_id": event.content_block.id
                                    }
                        
                        # Input da tool
                        elif event.type == 'content_block_delta':
                            if hasattr(event.delta, 'type'):
                                if event.delta.type == 'input_json_delta':
                                    yield {
                                        "type": "tool_input_delta",
                                        "input": event.delta.partial_json
                                    }
                
                # Mensagem final completa
                final_message = stream.get_final_message()
                yield {
                    "type": "message_complete",
                    "message": final_message
                }
                
        except Exception as e:
            log.bind(type="system").error(f"Erro no chat stream: {e}")
            yield {
                "type": "error",
                "error": str(e)
            }
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        use_tools: bool = False
    ) -> anthropic.types.Message:
        """
        Chat sem streaming (retorna mensagem completa)
        
        Args:
            messages: Lista de mensagens
            use_tools: Se True, permite ferramentas
            
        Returns:
            Mensagem completa do Claude
        """
        try:
            kwargs = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "messages": messages,
            }
            
            if use_tools:
                kwargs["system"] = MANUS_SYSTEM_PROMPT
                kwargs["tools"] = self.get_tools()
            
            response = self.client.messages.create(**kwargs)
            return response
            
        except Exception as e:
            log.bind(type="system").error(f"Erro no chat: {e}")
            raise


# Instância global
anthropic_client = AnthropicClient()