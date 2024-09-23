# Vaihe 1: Rakennusvaihe
FROM python:3.9-slim AS builder

# Asennetaan järjestelmäkirjastot ja rakennustyökalut
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        ffmpeg \
        cmake && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Päivitetään pip ja asennetaan riippuvuudet
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Vaihe 2: Lopullinen image
FROM python:3.9-slim

# Asennetaan vain tarvittavat runtime-kirjastot
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Asetetaan NUMBA_CACHE_DIR -ympäristömuuttuja
ENV NUMBA_CACHE_DIR=/tmp/numba_cache

# Kopioidaan vain tarvittavat tiedostot edellisestä vaiheesta
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

# Varmistetaan, että välimuistihakemistoon on kirjoitusoikeudet
RUN mkdir -p /tmp/numba_cache && chmod -R 777 /tmp/numba_cache

# Luodaan ja käytetään ei-root käyttäjää
RUN useradd -m appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "mask_api:app", "--host", "0.0.0.0", "--port", "8000"]