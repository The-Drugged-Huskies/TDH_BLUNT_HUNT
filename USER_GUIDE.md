# The Blunt Hunt - Developer User Guide

This document contains internal development notes, deployment instructions, and maintenance details for **The Blunt Hunt**.

## 📂 Project Structure

- **app.py**: Main Flask application entry point. Handles routes and API endpoints.
- **index.py**:  Likely an alternative entry point (legacy?). `app.py` is the one referenced in `vercel.json`.
- **templates/**: HTML templates. `index.html` is the main game interface.
- **static/**: Static assets.
  - **css/**: Stylesheets (`style.css`).
  - **js/**: Game logic (`game.js`, `sprite.js`, `audio.js`, `wallet.js`).
  - **images/**: Game assets.
  - **data/**: `leaderboard.json` stores local scores.

## 🛠️ Local Development

1. **Environment Setup**:
    Ensure you have Python 3 installed.
    It is recommended to use a virtual environment:

    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```

2. **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3. **Run Locally**:

    ```bash
    python app.py
    ```

    Access the game at `http://localhost:5000`.

## ☁️ Deployment (Vercel)

The project is configured for Vercel deployment via `vercel.json`.

1. **Configuration (`vercel.json`)**:
    - Specifies the runtime as `@vercel/python`.
    - Routes all traffic to `app.py`.

2. **Deploying**:
    - Push changes to the git repository connected to Vercel.
    - Alternatively, use the Vercel CLI:

      ```bash
      vercel
      ```

## 📝 Maintenance Notes

- **Leaderboard**:
  - The local `leaderboard.json` is **ephemeral** on serverless platforms like Vercel. It will reset on new deployments or cold starts.
  - **TODO**: For persistent production scores, integrate the Dogechain smart contract or a persistent database (Postgres/Redis).

- **Game Name**:
  - Ensure "The Blunt Hunt" is used consistently across metadata and UI.

- **Audio**:
  - Procedural audio is handled in `static/js/audio.js`.
  - See `MUSIC.md` for specific music generation logic.
