from fastapi import FastAPI, File, UploadFile
from PIL import Image
import torch
import clip

app = FastAPI()

model, preprocess = clip.load("ViT-B/32", device="cpu")

@app.post("/clip")
async def get_clip_features(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")

    # Preprocess the image
    image = preprocess(image).unsqueeze(0).to("cpu")

    # Prepare a set of text descriptions
    descriptions = [
        "a photo of a hotdog",
        "a photo of something that is not a hotdog",
    ]

    # Encode the text
    text = clip.tokenize(descriptions).to("cpu")

    # Encode the image and text
    with torch.no_grad():
        image_features = model.encode_image(image)
        text_features = model.encode_text(text)

    # Normalize the features
    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    # Compute similarity
    similarity = (image_features @ text_features.T).squeeze(0)

    # Find the best matching description
    best_match_idx = similarity.argmax().item()
    best_match_description = descriptions[best_match_idx]
    
    result = ""
    if best_match_description == "a photo of a hotdog":
        result = 'hotdog'
    else:
        result = 'not hotdog'

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

