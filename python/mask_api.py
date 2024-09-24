import io
import logging
import os
import tempfile
import numpy as np
from datetime import datetime
from fastapi import BackgroundTasks, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
from rembg import remove, new_session

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEBUG_FOLDER = "debug_images"
if not os.path.exists(DEBUG_FOLDER):
    os.makedirs(DEBUG_FOLDER)

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

# Luo uusi sessio rembg:lle
session = new_session(REMBG_SETTINGS["model_name"] if USE_CUSTOM_SETTINGS else "u2net")

@app.post("/create_mask/")
async def create_mask(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        logging.info("Received file: %s", file.filename)

        contents = await file.read()
        logging.info("File read successfully")

        img = Image.open(io.BytesIO(contents)).convert('RGBA')
        logging.info("Image opened and converted to RGBA")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_debug_path = os.path.join(DEBUG_FOLDER, f"original_{timestamp}.png")
        img.save(original_debug_path)
        logging.info(f"Original image saved for debug: {original_debug_path}")

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

        mask_debug_path = os.path.join(DEBUG_FOLDER, f"mask_{timestamp}.png")
        mask_img.save(mask_debug_path)
        logging.info(f"Mask saved for debug: {mask_debug_path}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp:
            mask_img.save(temp.name)
            temp_file = temp.name
            logging.info("Mask saved as temporary file: %s", temp_file)

        background_tasks.add_task(os.remove, temp_file)

        return FileResponse(temp_file, media_type="image/png", filename="mask.png")

    except Exception as e:
        logging.error("Error processing file: %s", str(e))
        return JSONResponse(status_code=500, content={"message": "Internal Server Error", "detail": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)