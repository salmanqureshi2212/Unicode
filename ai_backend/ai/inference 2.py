import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

CLASS_NAMES = [
    "bridge_crack",
    "broken_street_light",
    "pothole",
    "unknown",
    "water_leak"
]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def load_model(model_path="damage_classifier.pth"):
    model = models.resnet18(pretrained=False)

    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 5)

    model.load_state_dict(
        torch.load(model_path, map_location=torch.device("cpu"))
    )

    model.eval()  
    return model

model = load_model()

def predict_damage(image_path: str):
    try:

        image = Image.open(image_path).convert("RGB")
        
        image_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)

            confidence, class_id = torch.max(probabilities, dim=1)

        confidence = confidence.item()
        class_id = class_id.item()

        # Confidence threshold
        if confidence < 0.30:
            return {
                "damage_class": "unknown",
                "confidence": confidence
            }

        return {
            "damage_class": CLASS_NAMES[class_id],
            "confidence": confidence
        }

    except Exception as e:
        # Failure handling
        return {
            "damage_class": "unknown",
            "confidence": 0.0
        }