import json
from typing import AsyncGenerator, Dict, Any, List
from app.services.anthropic_client import anthropic_client
from app.services.file_manager import FileManager
from app.services.sandbox import SandboxExecutor
from app.core.logging import log


class AgentOrchestrator:
    """Orquestra a execução do agente com loop de tools"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.file_manager = FileManager(session_id)
        self.sandbox = SandboxExecutor(session_id)
        self.conversation_history = []
    
    async def execute_tool(
        self,
        tool_name: str,
        tool_input: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executa uma tool e retorna o resultado
        
        Args:
            tool_name: Nome da tool
            tool_input: Parâmetros da tool
            
        Returns:
            Resultado da execução
        """
        log.bind(type="agent").info(f"Executando tool: {tool_name}")
        log.bind(type="agent").debug(f"Input: {tool_input}")
        
        try:
            if tool_name == "run_command":
                result = await self.sandbox.run_command(
                    command=tool_input.get("command"),
                    cwd=tool_input.get("cwd", "."),
                )
                
                # Formatar output para o Claude
                output = f"Comando: {tool_input.get('command')}\n"
                output += f"Código de retorno: {result['returncode']}\n"
                output += f"Duração: {result['duration']:.2f}s\n\n"
                
                if result['stdout']:
                    output += f"STDOUT:\n{result['stdout']}\n"
                if result['stderr']:
                    output += f"STDERR:\n{result['stderr']}\n"
                
                return {
                    "success": result['success'],
                    "output": output,
                    "result": result
                }
            
            elif tool_name == "write_file":
                result = await self.file_manager.write_file(
                    path=tool_input.get("path"),
                    content=tool_input.get("content")
                )
                
                if result['success']:
                    output = f"✓ Arquivo '{tool_input.get('path')}' criado com sucesso ({result['size']} bytes)"
                else:
                    output = f"✗ Erro ao criar arquivo: {result.get('error')}"
                
                return {
                    "success": result['success'],
                    "output": output,
                    "result": result
                }
            
            elif tool_name == "read_file":
                result = await self.file_manager.read_file(
                    path=tool_input.get("path")
                )
                
                if result['success']:
                    output = f"Conteúdo de '{tool_input.get('path')}':\n\n{result['content']}"
                else:
                    output = f"✗ Erro ao ler arquivo: {result.get('error')}"
                
                return {
                    "success": result['success'],
                    "output": output,
                    "result": result
                }
            
            elif tool_name == "list_files":
                result = await self.file_manager.list_files(
                    path=tool_input.get("path", ".")
                )
                
                if result['success']:
                    tree = result['tree']
                    output = f"Estrutura de arquivos em '{tool_input.get('path', '.')}':\n\n"
                    output += self._format_tree(tree)
                else:
                    output = f"✗ Erro ao listar arquivos: {result.get('error')}"
                
                return {
                    "success": result['success'],
                    "output": output,
                    "result": result
                }
            
            else:
                return {
                    "success": False,
                    "output": f"Tool desconhecida: {tool_name}"
                }
        
        except Exception as e:
            log.bind(type="system").error(f"Erro ao executar tool {tool_name}: {e}")
            return {
                "success": False,
                "output": f"Erro: {str(e)}"
            }
    
    def _format_tree(self, node: Dict, prefix: str = "", is_last: bool = True) -> str:
        """Formata árvore de arquivos em ASCII"""
        output = ""
        connector = "└── " if is_last else "├── "
        output += prefix + connector + node['name'] + "\n"
        
        if node.get('children'):
            extension = "    " if is_last else "│   "
            for i, child in enumerate(node['children']):
                is_last_child = i == len(node['children']) - 1
                output += self._format_tree(child, prefix + extension, is_last_child)
        
        return output
    
    async def process_message(
        self,
        user_message: str,
        mode: str = "assistant"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Processa uma mensagem do usuário e executa o loop do agente
        
        Args:
            user_message: Mensagem do usuário
            mode: "assistant" (só conversa) ou "agent" (com tools)
            
        Yields:
            Eventos do processamento (text_delta, tool_use, etc)
        """
        # Adicionar mensagem do usuário ao histórico
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        use_tools = (mode == "agent")
        
        # Loop para lidar com tool calls
        max_iterations = 10  # Prevenir loops infinitos
        iteration = 0
        
        accumulated_text = ""
        assistant_message_content = []
        
        while iteration < max_iterations:
            iteration += 1
            
            log.bind(type="agent").info(f"Iteração {iteration} do agente")
            
            # Chamar Claude com streaming
            current_tool_use = None
            current_tool_input = ""
            
            async for chunk in anthropic_client.chat_stream(
                messages=self.conversation_history,
                use_tools=use_tools
            ):
                chunk_type = chunk.get("type")
                
                # Texto sendo gerado
                if chunk_type == "text_delta":
                    text = chunk.get("text", "")
                    accumulated_text += text
                    
                    yield {
                        "type": "message_chunk",
                        "content": text
                    }
                
                # Claude quer usar uma tool
                elif chunk_type == "tool_use_start":
                    current_tool_use = {
                        "id": chunk.get("tool_id"),
                        "name": chunk.get("tool_name"),
                        "input": ""
                    }
                    
                    yield {
                        "type": "tool_use_start",
                        "tool_name": chunk.get("tool_name")
                    }
                
                # Input da tool sendo montado
                elif chunk_type == "tool_input_delta":
                    current_tool_input += chunk.get("input", "")
                
                # Mensagem completa
                elif chunk_type == "message_complete":
                    message = chunk.get("message")
                    
                    # Processar conteúdo da mensagem
                    for content_block in message.content:
                        if content_block.type == "text":
                            assistant_message_content.append(content_block)
                        
                        elif content_block.type == "tool_use":
                            # Tool use detectado
                            tool_name = content_block.name
                            tool_input = content_block.input
                            tool_id = content_block.id
                            
                            # Notificar frontend
                            yield {
                                "type": "agent_action",
                                "action": {
                                    "type": "command" if tool_name == "run_command" else f"file_{tool_name.replace('_file', '')}",
                                    "description": f"{tool_name}({json.dumps(tool_input, ensure_ascii=False)})",
                                    "status": "running"
                                }
                            }
                            
                            # Executar tool
                            tool_result = await self.execute_tool(tool_name, tool_input)
                            
                            # Enviar output para o terminal se for comando
                            if tool_name == "run_command":
                                yield {
                                    "type": "terminal_output",
                                    "output": tool_result.get("output", "")
                                }
                            
                            # Notificar conclusão
                            yield {
                                "type": "agent_action",
                                "action": {
                                    "type": "command" if tool_name == "run_command" else f"file_{tool_name.replace('_file', '')}",
                                    "description": f"{tool_name} concluído",
                                    "status": "success" if tool_result['success'] else "error",
                                    "output": tool_result.get("output", "")
                                }
                            }
                            
                            # Adicionar resultado ao histórico
                            assistant_message_content.append(content_block)
                            
                            # Preparar resposta da tool para o Claude
                            self.conversation_history.append({
                                "role": "assistant",
                                "content": message.content
                            })
                            
                            self.conversation_history.append({
                                "role": "user",
                                "content": [
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_id,
                                        "content": tool_result.get("output", "")
                                    }
                                ]
                            })
                            
                            # Continuar loop (Claude vai processar o resultado)
                            break
                    
                    else:
                        # Nenhuma tool use - finalizar
                        self.conversation_history.append({
                            "role": "assistant",
                            "content": accumulated_text
                        })
                        
                        yield {
                            "type": "message_complete",
                            "content": accumulated_text
                        }
                        
                        return
            
            # Se chegou aqui, tinha tool use - continuar loop
            accumulated_text = ""
            assistant_message_content = []
        
        # Max iterations atingido
        log.bind(type="agent").warning(f"Max iterations ({max_iterations}) atingido")
        yield {
            "type": "error",
            "error": "Número máximo de iterações atingido"
        }
