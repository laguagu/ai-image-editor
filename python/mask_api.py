import io
import logging
import os
import tempfile

import numpy as np
from fastapi import BackgroundTasks, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
from rembg import remove

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Lisää tähän frontend-sovelluksesi osoite
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test")
async def test_endpoint():
    return JSONResponse(content={"message": "Toimii."})


@app.post("/create_mask/")
async def create_mask(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        logging.info("Received file: %s", file.filename)

        # Lue ladattu kuva
        contents = await file.read()
        logging.info("File read successfully")

        img = Image.open(io.BytesIO(contents)).convert('RGBA')
        logging.info("Image opened and converted to RGBA")

        # Poista tausta käyttäen rembg-kirjastoa
        img_no_bg = remove(img)
        logging.info("Background removed successfully")

        # Muunna kuva NumPy-taulukoksi
        data = np.array(img_no_bg)
        logging.info("Image converted to NumPy array")

        # Erota alpha-kanava
        alpha = data[:, :, 3]

        # Luo maski perustuen alpha-kanavaan
        mask = np.where(alpha == 0, 255, 0).astype(np.uint8)
        logging.info("Mask created successfully")

        # Luo uusi kuva maskista
        mask_img = Image.fromarray(mask, mode='L')

        # Luo väliaikainen tiedosto tempfile-kirjaston avulla
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp:
            mask_img.save(temp.name)
            temp_file = temp.name
            logging.info("Mask saved as temporary file: %s", temp_file)

        # Poista väliaikainen tiedosto vastauksen jälkeen
        background_tasks.add_task(os.remove, temp_file)

        # Palauta maski
        return FileResponse(temp_file, media_type="image/png", filename="mask.png")

    except Exception as e:
        logging.error("Error processing file: %s", str(e))
        return JSONResponse(status_code=500, content={"message": "Internal Server Error", "detail": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
