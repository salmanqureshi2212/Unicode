from fastapi import FastAPI, UploadFile, Form
from app.prompt import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.gemini_client import call_gemini
from app.validator import validate_response
from app.fallback import fallback_response

app = FastAPI()

@app.post("/analyze")
async def analyze(
    image: UploadFile,
    infra_type: str = Form(...),
    zone_type: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...)
):
    image_bytes = await image.read()

    prompt = SYSTEM_PROMPT + USER_PROMPT_TEMPLATE.format(
        infra_type=infra_type,
        zone_type=zone_type,
        lat=lat,
        lng=lng
    )

    raw_output = call_gemini(image_bytes, prompt)
    validated = validate_response(raw_output)

    if validated is None:
        return fallback_response()

    return validated
