# TDH Blunt Hunt - Dogechain Edition

A browser-based physics game where you hunt huskies with blunts, featuring an on-chain Dogechain leaderboard and prize pot system.

## 🛠 Tech Stack

* **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas.
* **Backend**: Python (Flask) for signature generation.
* **Blockchain**: Solidity (Dogechain Smart Contract).
* **Web3**: `ethers.js` (Frontend), `web3.py` (Backend).

## 🚀 Setup & Installation

1. **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    npm install
    ```

2. **Environment Configuration**:
    Create a `.env` file in the root with:

    ```env
    SIGNER_PRIVATE_KEY=your_backend_signer_private_key
    ```

    *Note: The corresponding public address must be set in the smart contract via `setSignerAddress`.*

3. **Run Locally**:

    ```bash
    python app.py
    ```

    Access at `http://localhost:5000`.

## 🎮 How to Play

1. Connect Dogechain Wallet.
2. Pay 1 DOGE to buy a "Ticket".
3. Drag and shoot blunts at huskies to score points.
4. Submit score to the leaderboard (requires signature).
