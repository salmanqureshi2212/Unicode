import os
import io
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def call_gemini(image_bytes: bytes, prompt: str):
    try:
        image = Image.open(io.BytesIO(image_bytes))

        response = model.generate_content(
            [prompt, image],
            generation_config={
                "temperature": 0,
                "top_p": 1,
                "top_k": 1,
                "max_output_tokens": 512
            }
        )

        return response.text

    except Exception as e:
        print("Gemini error:", str(e))
        return None
