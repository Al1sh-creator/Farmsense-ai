import os
import json
import logging
import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

class VisionService:
    def __init__(self):
        # Initialize Groq for Vision
        self.llm = ChatGroq(
            api_key=os.environ.get("GROQ_API_KEY"),
            model_name="qwen/qwen3.6-27b",
            temperature=0.2,
        )

    def analyze_disease(self, base64_image: str, crop_type: str = "Unknown/Other") -> dict:
        try:
            logger.info(f"Sending image to Groq Vision (qwen/qwen3.6-27b) for crop: {crop_type}...")
            
            prompt = (
                f"You are an expert agronomist. Analyze this {crop_type} plant leaf image. "
                "Identify the plant disease if present. If it looks healthy, say so. "
                "Your response MUST be ONLY a raw, valid JSON object, without any markdown formatting or code blocks. "
                "Do not wrap the JSON in ```json...```. Output strictly the following JSON structure: "
                "{\"disease_name\": \"...\", \"confidence\": 95, \"organic_treatment\": \"...\", \"chemical_treatment\": \"...\", \"description\": \"...\"}"
            )

            # Format for Vision model
            message = HumanMessage(
                content=[
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            )

            # Get the response
            print("\n[Vision AI] --- Analyzing Image... ---")
            response = self.llm.invoke([message])
            content = response.content
            print("\n[Vision AI] --- Finished Analysis! ---")
            
            # Use regex to find the first '{' and last '}' to extract only the JSON object
            start_idx = content.find('{')
            end_idx = content.rfind('}')
            
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                cleaned_content = content[start_idx:end_idx+1]
            else:
                cleaned_content = content.strip()
                
            return json.loads(cleaned_content)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON from Groq response: {str(e)}")
            return {
                "error": "Failed to parse AI response.",
                "raw_response": content
            }
        except Exception as e:
            logger.error(f"Vision Service Error: {str(e)}")
            return {
                "error": str(e)
            }

vision_service = VisionService()
