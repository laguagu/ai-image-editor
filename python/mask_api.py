import io
import os

import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from rembg import remove

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Lisää tähän frontend-sovelluksesi osoite
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/create_mask/")
async def create_mask(file: UploadFile = File(...)):
    # Lue ladattu kuva
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert('RGBA')

    # Poista tausta käyttäen rembg-kirjastoa
    img_no_bg = remove(img)

    # Muunna kuva NumPy-taulukoksi
    data = np.array(img_no_bg)

    # Erota alpha-kanava
    alpha = data[:, :, 3]

    # Luo maski perustuen alpha-kanavaan (käänteinen Stability AI:ta varten)
    # Täysin läpinäkyvät pikselit (alpha == 0) muuttuvat valkoisiksi (255)
    # Kaikki muut pikselit muuttuvat mustiksi (0)
    mask = np.where(alpha == 0, 255, 0).astype(np.uint8)

    # Luo uusi kuva maskista
    mask_img = Image.fromarray(mask, mode='L')

    # Tallenna maski väliaikaisesti
    temp_file = "temp_mask.png"
    mask_img.save(temp_file)

    # Palauta maski
    return FileResponse(temp_file, media_type="image/png", filename="mask.png")


@app.on_event("shutdown")
def shutdown_event():
    # Poista väliaikainen tiedosto kun sovellus suljetaan
    if os.path.exists("temp_mask.png"):
        os.remove("temp_mask.png")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
