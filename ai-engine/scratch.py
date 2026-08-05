import os
import requests

api_key = "[ENCRYPTION_KEY]"
url = "https://api.groq.com/openai/v1/models"
headers = {"Authorization": f"Bearer {api_key}"}

response = requests.get(url, headers=headers)
models = response.json().get("data", [])

print("Available Groq Models:")
for m in models:
    print(f"- {m['id']}")
