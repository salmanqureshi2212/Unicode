from fastapi import FastAPI, UploadFile, Form
from app.prompt import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.gemini_client import call_gemini
from app.validator import validate_response
from app.fallback import fallback_response
import base64
from pydantic import BaseModel

app = FastAPI()

class AnalyeRequest(BaseModel):
    image:str
    infra_type: str
    zone_type: str
    lat: float
    lng: float

@app.post("/analyze")
async def analyze(request: AnalyeRequest):
    # infra_type: str = Form(...),
    # zone_type: str = Form(...),
    # lat: float = Form(...),
    # lng: float = Form(...)
    image_bytes = base64.b64decode(request.image)

    prompt = SYSTEM_PROMPT + USER_PROMPT_TEMPLATE.format(
        infra_type=request.infra_type,
        zone_type=request.zone_type,
        lat=request.lat,
        lng=request.lng
    )

    raw_output = call_gemini(image_bytes, prompt)
    validated = validate_response(raw_output)

    if validated is None:
        return fallback_response()

    return validated
