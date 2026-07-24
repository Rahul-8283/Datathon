import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parents[1]
sys.path.append(str(backend_path))

from core.config import Settings
import google.generativeai as genai

def list_models():
    settings = Settings()
    api_key = settings.gemini_api_key.get_secret_value() if hasattr(settings.gemini_api_key, 'get_secret_value') else settings.gemini_api_key
    print("Configuring genai with key:", api_key)
    genai.configure(api_key=api_key)
    
    print("\nAvailable models:")
    try:
        for m in genai.list_models():
            print(f" - Name: {m.name} | Supported Actions: {m.supported_generation_methods}")
    except Exception as e:
        print("Failed to list models:", type(e), str(e))

if __name__ == "__main__":
    list_models()
