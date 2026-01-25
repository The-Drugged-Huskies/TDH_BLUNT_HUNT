# 🕵️ Supervisor Code Audit & Improvement Plan

**Status**: 🟢 Operational (Deployed)
**Version**: 0.69 (Secured)
**Date**: 2026-01-25

After inspecting the current codebase (`app.py`, `Leaderboard.sol`, `game.js`, `wallet.js`), I have compiled the following list of critical fixes, architectural improvements, and polish items.

## 🚨 1. Critical & Security

- [ ] **Fail-Open Contract Design**:
  - **Issue**: In `Leaderboard.sol`, the logic `if (signerAddress != address(0))` means that if the signer is *not* set, the contract accepts **any** score.
  - **Risk**: If you accidentally unset the signer or redeploy without setting it, the leaderboard is open to basic spoofing.
  - **Fix**: Consider making the signer mandatory or emitting a "SecurityWarning" event if playing in unsecured mode.
- [ ] **Hardcoded Contract Addresses (Don't Repeat Yourself)**:
  - **Issue**: The contract address `0x2e50...` is repeated in:
        1. `static/js/wallet.js`
        2. `static/withdraw.html`
        3. `verify_signer.py`
        4. `static/test.html`
  - **Fix**: Centralize this. For frontend, use a `config.js`. For scripts, read from a shared config or `.env`.
- [ ] **Git History Cleanliness**:
  - **Issue**: `env.json` was deleted, but ensure it wasn't committed in previous git commits.
  - **audit**: Run a BFG Repo-Cleaner or similar if this was a public repo.

## 🛠 2. Architecture & Code Quality

- [ ] **Monolithic `game.js`**:
  - **Issue**: The `Game` class is approaching 1500 lines. It handles Rendering, Physics, Input, UI, and Audio calls.
  - **Fix**: Refactor into modules:
    - `src/entities/Husky.js`
    - `src/entities/Slingshot.js`
    - `src/systems/Physics.js`
    - `src/ui/Hud.js`
- [ ] **Frontend/Backend Configuration Sync**:
  - **Issue**: `app.py` has `MAX_LEADERBOARD_ENTRIES = 500`. `Leaderboard.sol` has `MAX_LEADERBOARD_SIZE = 100`.
  - **Fix**: The source of truth should be the Blockchain. The frontend/backend should query the contract for the limit (or at least match constants).

## 🚀 3. UX & Polish

- [ ] **consistent Error UI**:
  - **Issue**: Some parts of `wallet.js` (e.g., connection errors) still use `alert()`, while others use the nice `showCustomModal`.
  - **Fix**: Grep for `alert(` and replace all with `showCustomModal`.
- [ ] **Ticket State Clarity**:
  - **Issue**: Players might not understand why they need to "Pay 1 DOGE".
  - **Fix**: The UI should explicitly say "Ticket Required" vs "Ticket Active" in a permanent HUD element, rather than just disabling the button.

## 📦 4. Deployment

- [ ] **Cleanup**:
  - `static/test.html` and `debug_env.py` (deleted) are dev tools.
  - **Action**: Ensure `test.html` is removed or protected before a "Launch" to production, or move it to a `dev/` folder.

---

### Recommended Immediate Actions (Next Session)

1. **Refactor `wallet.js`** to remove `alert()`.
2. **Centralize Contract Address** into a `static/js/config.js` file.
