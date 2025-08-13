import io
import logging
import os
import platform
import tempfile

import numpy as np
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image
from rembg import new_session, remove

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Määritä, käytetäänkö mukautettuja asetuksia vai ei
USE_CUSTOM_SETTINGS = False  # Aseta False käyttääksesi oletusasetuksia

# rembg asetukset
REMBG_SETTINGS = {
    "model_name": "u2net",
    "alpha_matting": True,
    "alpha_matting_foreground_threshold": 240,
    "alpha_matting_background_threshold": 10,
    "alpha_matting_erode_size": 10,
}

# Aseta U2NET_HOME ympäristömuuttuja (Windows-yhteensopiva)
if platform.system() == "Windows":
    os.environ['U2NET_HOME'] = os.path.join(tempfile.gettempdir(), '.u2net')
else:
    os.environ['U2NET_HOME'] = '/tmp/.u2net'

# Luo uusi sessio rembg:lle
session = new_session(
    REMBG_SETTINGS["model_name"] if USE_CUSTOM_SETTINGS else "u2net")

@app.post("/create-mask/")
async def create_mask(request: Request, file: UploadFile = File(...)):
    logging.info(f"Request headers: {request.headers}")
    try:
        logging.info("Received file: %s", file.filename)

        contents = await file.read()
        logging.info("File read successfully")

        img = Image.open(io.BytesIO(contents)).convert('RGBA')
        logging.info("Image opened and converted to RGBA")

        # Poista tausta käyttäen rembg-kirjastoa
        if USE_CUSTOM_SETTINGS:
            img_no_bg = remove(
                img,
                session=session,
                alpha_matting=REMBG_SETTINGS["alpha_matting"],
                alpha_matting_foreground_threshold=REMBG_SETTINGS["alpha_matting_foreground_threshold"],
                alpha_matting_background_threshold=REMBG_SETTINGS["alpha_matting_background_threshold"],
                alpha_matting_erode_size=REMBG_SETTINGS["alpha_matting_erode_size"]
            )
            logging.info("Background removed with custom settings")
        else:
            img_no_bg = remove(img, session=session)
            logging.info("Background removed with default settings")

        data = np.array(img_no_bg)
        logging.info("Image converted to NumPy array")

        alpha = data[:, :, 3]
        mask = np.where(alpha == 0, 255, 0).astype(np.uint8)
        logging.info("Mask created successfully")

        mask_img = Image.fromarray(mask, mode='L')

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp:
            mask_img.save(temp.name)
            logging.info("Mask saved as temporary file: %s", temp.name)
            
            # Lue tiedosto ja poista se heti
            with open(temp.name, 'rb') as f:
                img_data = f.read()
            
            # Poista väliaikainen tiedosto
            try:
                os.unlink(temp.name)
            except OSError:
                logging.warning("Could not delete temporary file: %s", temp.name)
            
            return StreamingResponse(
                io.BytesIO(img_data), 
                media_type="image/png", 
                headers={"Content-Disposition": "attachment; filename=mask.png"}
            )

    except Exception as e:
        logging.error("Error processing file: %s", str(e), exc_info=True)
        return JSONResponse(status_code=500, content={"message": "Internal Server Error", "detail": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)