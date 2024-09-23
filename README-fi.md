# Kuvan muokkaus tekoälyn avulla

Tämä projekti mahdollistaa kuvien muokkaamisen tekoälyn avulla käyttäen Stability AI:n API:a. Projektissa on kaksi pääominaisuutta: taustan muokkaus ja Search and Replace -toiminto.

## Miten se toimii?

### Taustan muokkaus

1. Käyttäjä lataa alkuperäisen kuvan.
2. Käyttäjä voi valita automaattisen maskin luonnin tai ladata oman maskin.
3. Jos valitaan automaattinen maski, backend luo maskin alkuperäisestä kuvasta.
4. Käyttäjä antaa kuvauksen haluamastaan uudesta taustasta.
5. Tekoäly generoi uuden kuvan annettujen tietojen perusteella.

### Search and Replace

1. Käyttäjä lataa muokattavan kuvan.
2. Käyttäjä kirjoittaa kuvauksen haluamastaan lopputuloksesta (`prompt`).
3. Käyttäjä määrittelee korvattavan elementin (`search_prompt`).
4. Tekoäly tunnistaa ja korvaa määritellyn elementin automaattisesti ilman erillistä maskia.

## Esimerkkikuvat

### Taustan muokkaus

#### Alkuperäinen kuva

![Alkuperäinen kuva](public/example-images/auto.png)

_Kuvateksti: Tämä on alkuperäinen kuva, jota käytämme esimerkkinä taustan muokkauksessa._

#### Luotu maski

![Luotu maski](public/example-images/temp_mask.png)

_Kuvateksti: Tämä on automaattisesti luotu maski. Valkoiset alueet korvataan uudella sisällöllä, mustat alueet säilytetään._

#### Lopullinen tulos (taustan muokkaus)

![Lopullinen tulos taustan muokkauksesta](public/example-images/example-2.png)

_Kuvateksti: Tämä on lopullinen tulos, jossa alkuperäisen kuvan tausta on muokattu annetun kuvauksen mukaisesti._

### Search and Replace

#### Alkuperäinen kuva

![Alkuperäinen kuva Search and Replace](public/example-images/husky.png)

_Kuvateksti: Tämä on alkuperäinen kuva, jota käytämme esimerkkinä Search and Replace -toiminnossa._

#### Lopullinen tulos (Search and Replace)

![Lopullinen tulos Search and Replace](public/example-images/example-1.png)

_Kuvateksti: Tämä on lopullinen tulos Search and Replace -toiminnosta, jossa määritelty elementti on korvattu uudella._

## Tekninen toteutus

- Frontend: React.js
- Backend: FastAPI (taustan muokkauksessa maskin luontiin)
- Tekoäly-API: Stability AI

Backend luo maskin käyttäen `rembg`-kirjastoa taustan poistamiseen taustan muokkaus -ominaisuudessa. Frontend kommunikoi sekä oman backendin että Stability AI:n API:n kanssa.

## Käyttöohjeet

### Taustan muokkaus

1. Lataa alkuperäinen kuva.
2. Valitse "Use automatic mask" tai lataa oma maski.
3. Kirjoita kuvaus haluamastasi uudesta taustasta.
4. Paina "Create Edited Image" -nappia.
5. Odota hetki, kun tekoäly generoi uuden kuvan.
6. Lataa valmis kuva "Download Image" -napilla.

### Search and Replace

1. Lataa muokattava kuva.
2. Kirjoita kuvaus haluamastasi lopputuloksesta (Desired Output Description).
3. Määrittele korvattava elementti (Element to Replace).
4. Valitse haluttu tuloskuvan formaatti.
5. Paina "Replace Element" -nappia.
6. Odota hetki, kun tekoäly generoi uuden kuvan.

## Huomioitavaa

- Automaattinen maskin luonti toimii parhaiten kuvilla, joissa on selkeä etu- ja taka-ala.
- Search and Replace -toiminto ei vaadi erillistä maskia, vaan se tunnistaa korvattavan elementin automaattisesti.
- Parhaan tuloksen saat käyttämällä tarkkaa ja kuvailevaa tekstiä haluamastasi lopputuloksesta.
- Prosessi voi kestää muutamia sekunteja riippuen kuvan koosta ja monimutkaisuudesta.
- Search and Replace -toiminto kuluttaa 4 krediittiä per onnistunut generointi, kun taas taustan muokkaus kuluttaa 3 krediittiä.

## Projektin rakenne

```
background-remover/
│
├── app/
├── components/
├── lib/
├── public/
├── python/
│   ├── __pycache__/
│   ├── myenv/
│   ├── Dockerfile
│   ├── main.py
│   ├── mask_api.py
│   ├── requirements.txt
│   └── sohva.jpg
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
├── README.md
└── [muut konfiguraatiotiedostot]
```

## Miten se toimii?

[Aiemmat osiot pysyvät samoina]

## Tekninen toteutus

- Frontend: React.js, Next.js
- Backend: FastAPI (Python)
- Tekoäly-API: Stability AI

Backend luo maskin käyttäen `rembg`-kirjastoa taustan poistamiseen taustan muokkaus -ominaisuudessa. Frontend kommunikoi sekä oman backendin että Stability AI:n API:n kanssa.

## Käyttöönotto ja käynnistys

### Backend (FastAPI)

1. Siirry Python-backendin hakemistoon:

   ```
   cd python
   ```

2. (Suositeltu) Luo ja aktivoi virtuaaliympäristö:

   ```
   python -m venv myenv
   source myenv/bin/activate  # Unix/macOS
   myenv\Scripts\activate  # Windows
   ```

3. Asenna tarvittavat riippuvuudet:

   ```
   pip install -r requirements.txt
   ```

4. Käynnistä FastAPI-palvelin:

   ```
   uvicorn mask_api:app --reload
   ```

   Palvelin käynnistyy osoitteeseen `http://localhost:8000`.

### Frontend (Next.js)

1. Asenna tarvittavat npm-paketit projektin juurihakemistossa:

   ```
   npm install
   ```

2. Käynnistä kehityspalvelin:

   ```
   npm run dev
   ```

   Frontend-sovellus käynnistyy osoitteeseen `http://localhost:3000`.

## Huomioitavaa

- Varmista, että sekä frontend- että backend-palvelimet ovat käynnissä samanaikaisesti.
- Backend-palvelin (FastAPI) tulee käynnistää ennen frontend-sovellusta.
- Automaattinen maskin luonti toimii parhaiten kuvilla, joissa on selkeä etu- ja taka-ala.
- Search and Replace -toiminto ei vaadi erillistä maskia, vaan se tunnistaa korvattavan elementin automaattisesti.
- Parhaan tuloksen saat käyttämällä tarkkaa ja kuvailevaa tekstiä haluamastasi lopputuloksesta.
- Prosessi voi kestää muutamia sekunteja riippuen kuvan koosta ja monimutkaisuudesta.
- Search and Replace -toiminto kuluttaa 4 krediittiä per onnistunut generointi, kun taas taustan muokkaus kuluttaa 3 krediittiä.

## Ympäristömuuttujat

Varmista, että olet asettanut seuraavat ympäristömuuttujat:

- `NEXT_PUBLIC_STABILITY_API_KEY`: Stability AI API-avain

Voit asettaa nämä `.env`-tiedostossa projektin juurihakemistossa.

### Kontitettu versio (Docker)

1. Kloonaa repositorio:

   ```
   git clone [repositorion-url]
   cd background-remover
   ```

2. Aseta ympäristömuuttujat:

   - Luo `.env` tiedosto projektin juurihakemistoon
   - Lisää siihen rivi: `NEXT_PUBLIC_STABILITY_API_KEY=sinun_api_avaimesi`

3. Rakenna ja käynnistä kontit:

   ```
   docker-compose up --build
   ```

4. Sovellus on nyt käytettävissä:

   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

5. Pysäyttääksesi ja poistaaksesi kontit, käytä:
   ```
   docker-compose down
   ```
