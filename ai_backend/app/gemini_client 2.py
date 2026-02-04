import os
from google import genai
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

# Initialize Gemini client (NEW SDK)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def call_gemini(image_bytes: bytes, prompt: str) -> str:
    image = Image.open(io.BytesIO(image_bytes))

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            prompt,
            image
        ],
        config={
            "temperature": 0,
            "top_p": 1,
            "top_k": 1
        }
    )

    return response.text
