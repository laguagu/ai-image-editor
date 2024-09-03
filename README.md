# Background Remover | FastAPI | Next.js

This project consists of a FastAPI backend for removing backgrounds from images and a Next.js frontend for interacting with the backend service.

## Project Structure

```
background-remover/
├── python/
│   ├── main.py
│   └── requirements.txt
├── app/
│   └── (Next.js frontend files)
└── README.md
```

## Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn

## Setup Instructions

### Backend (FastAPI)

1. Navigate to the `python` directory:

   ```
   cd background-remover/python
   ```

2. Create a virtual environment:

   ```
   python -m venv venv
   ```

3. Activate the virtual environment:

   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required Python packages:

   ```
   pip install -r requirements.txt
   ```

5. Run the FastAPI server:

   ```
   uvicorn main:app --reload
   ```

   The backend server should now be running at `http://localhost:8000`.

### Frontend (Next.js)

1. Navigate to the `app` directory:

   ```
   cd background-remover/app
   ```

2. Install the required npm packages:

   ```
   npm install
   ```

   or if you're using yarn:

   ```
   yarn install
   ```

3. Run the Next.js development server:

   ```
   npm run dev
   ```

   or with yarn:

   ```
   yarn dev
   ```

   The frontend should now be accessible at `http://localhost:3000`.

## Usage

1. Open your web browser and go to `http://localhost:3000`.
2. Use the file input to select an image.
3. Click the "Remove Background" button to process the image.
4. The processed image with the background removed will be displayed on the page.

## Troubleshooting

- If you encounter CORS issues, ensure that your FastAPI backend is configured to allow requests from `http://localhost:3000`.
- If the image processing fails, check the console logs in both the frontend and backend for error messages.
