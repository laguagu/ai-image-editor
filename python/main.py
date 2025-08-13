import base64
import io
from typing import Optional

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image, UnidentifiedImageError
from rembg import new_session, remove

app = FastAPI()

# CORS-middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp"}

# Luodaan rembg-sessio
session = new_session()

# alpha matting -arvot
ALPHA_MATTING_FOREGROUND_THRESHOLD = 240  # Voit säätää tätä arvoa (0-255)
ALPHA_MATTING_BACKGROUND_THRESHOLD = 10   # Voit säätää tätä arvoa (0-255)


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.post("/remove-background/")
async def remove_background(
    file: UploadFile = File(...),
    alpha_matting: Optional[bool] = Form(False)
):
    if not file.filename or not allowed_file(file.filename):
        raise HTTPException(
            status_code=400, detail="Tiedostomuoto ei ole tuettu. Tuetut muodot: PNG, JPG, JPEG, GIF, BMP")

    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))

        if alpha_matting:
            output_image = remove(
                input_image,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=ALPHA_MATTING_FOREGROUND_THRESHOLD,
                alpha_matting_background_threshold=ALPHA_MATTING_BACKGROUND_THRESHOLD
            )
        else:
            output_image = remove(input_image, session=session)

        # Varmista että output_image on PIL Image
        if not isinstance(output_image, Image.Image):
            if isinstance(output_image, np.ndarray):
                output_image = Image.fromarray(output_image)
            else:
                raise HTTPException(status_code=500, detail="Unexpected image format from rembg")

        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        return StreamingResponse(img_byte_arr, media_type="image/png")
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=400, detail="Kuvatiedostoa ei voitu tunnistaa")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Virhe käsiteltäessä kuvaa: {str(e)}")


@app.post("/remove-background-base64/")
async def remove_background_base64(
    file: UploadFile = File(...),
    alpha_matting: Optional[bool] = Form(False)
):
    if not file.filename or not allowed_file(file.filename):
        raise HTTPException(
            status_code=400, detail="Tiedostomuoto ei ole tuettu. Tuetut muodot: PNG, JPG, JPEG, GIF, BMP")

    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))

        if alpha_matting:
            output_image = remove(
                input_image,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=ALPHA_MATTING_FOREGROUND_THRESHOLD,
                alpha_matting_background_threshold=ALPHA_MATTING_BACKGROUND_THRESHOLD
            )
        else:
            output_image = remove(input_image, session=session)

        # Varmista että output_image on PIL Image
        if not isinstance(output_image, Image.Image):
            if isinstance(output_image, np.ndarray):
                output_image = Image.fromarray(output_image)
            else:
                raise HTTPException(status_code=500, detail="Unexpected image format from rembg")

        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return JSONResponse(content={"image": img_str})
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=400, detail="Kuvatiedostoa ei voitu tunnistaa")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Virhe käsiteltäessä kuvaa: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
