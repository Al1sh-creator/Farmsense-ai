"""
==========================================================
File: ollama_service.py

What:
    This file is responsible for communicating with Ollama.

Why:
    We don't want the Decision Engine to know how Ollama works.
    The Decision Engine should only ask for an AI response.

Responsibilities:
    - Connect to Ollama
    - Send Prompt
    - Receive Response
    - Return AI Response
    - Parse JSON output
==========================================================
"""

import json
import logging
import re
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        # We use qwen2.5:1.5b as specified.
        # temperature can be adjusted as needed.
        self.llm = ChatOllama(
            model="qwen2.5:1.5b",
            format="json",  
            temperature=0.2, 
            num_ctx=3000
        )

    def generate_response(self, prompt: str) -> dict:
        try:
            logger.info("Sending prompt to Ollama (qwen2.5:1.5b)...")
            
            # Use stream to show live generation in the terminal
            print("\n[AI Module] --- Ollama is typing (Live Generation)... ---")
            content = ""
            for chunk in self.llm.stream([HumanMessage(content=prompt)]):
                content += chunk.content
                print(chunk.content, end="", flush=True)
            print("\n[AI Module] --- Finished typing! ---")
            
            # Clean up potential markdown formatting wrapping the JSON
            cleaned_content = re.sub(r'^```(?:json)?\n', '', content.strip())
            cleaned_content = re.sub(r'\n```$', '', cleaned_content.strip())
            
            return json.loads(cleaned_content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON from Ollama response: {str(e)}")
            logger.error(f"Raw content: {content}")
            return {
                "error": "Failed to parse AI response.",
                "raw_response": content
            }
        except Exception as e:
            logger.error(f"Ollama Service Error: {str(e)}")
            return {
                "error": str(e)
            }

ollama_service = OllamaService()