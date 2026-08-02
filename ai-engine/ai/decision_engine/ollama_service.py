"""
==========================================================
File: ollama_service.py

What:
    This file is responsible for communicating with Ollama.

Why:
    We don't want the Decision Engine to know how Ollama works.
    The Decision Engine should only ask for an AI response.

Flow:
    Decision Engine
            │
            ▼
    Prompt Builder
            │
            ▼
    Ollama Service
            │
            ▼
        Ollama Model
            │
            ▼
      AI Generated Response

Responsibilities:
    - Connect to Ollama
    - Send Prompt
    - Receive Response
    - Return AI Response
==========================================================
"""

import ollama


class OllamaService:

    def generate_response(self, prompt):

        response = ollama.chat(
            model="qwen2.5:7b",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        return response["message"]["content"]


ollama_service = OllamaService()