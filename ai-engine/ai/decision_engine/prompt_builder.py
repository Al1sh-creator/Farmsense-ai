"""
==========================================================
File: prompt_builder.py

What:
    Builds prompts for the AI model.

Why:
    We don't want prompt creation logic inside the
    Decision Engine.

Responsibilities:
    - Build AI prompt
    - Combine context
    - Return final prompt
==========================================================
"""


class PromptBuilder:

    def build(self, context, knowledge):

        prompt = f"""
You are an expert agricultural AI assistant.

Farmer Context:
{context}

Relevant Agricultural Knowledge:
{knowledge}

Task:
1. Review the ML predictions.
2. Explain whether they are suitable.
3. Mention possible risks.
4. Suggest better alternatives if needed.
5. Give farmer-friendly recommendations.

Respond in a clear and structured format.
"""

        return prompt.strip()


prompt_builder = PromptBuilder()